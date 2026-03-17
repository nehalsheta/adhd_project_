import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, answers, completed, userData } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Validate userData
    if (userData) {
      if (!userData.age || typeof userData.age !== 'number' || userData.age < 1 || userData.age > 120) {
        return NextResponse.json({ error: 'Invalid age. Age must be a number between 1 and 120.' }, { status: 400 });
      }
      if (!['male', 'female'].includes(userData.gender)) {
        return NextResponse.json({ error: 'Invalid gender. Gender must be either "male" or "female".' }, { status: 400 });
      }
    }

    // Create or update survey response
    const existingSurvey = await db.surveyResponse.findUnique({
      where: { sessionId },
    });

    let survey;
    if (existingSurvey) {
      survey = await db.surveyResponse.update({
        where: { sessionId },
        data: { 
          completed: completed ?? false,
          ...(userData && {
            name: userData.name,
            address: userData.address,
            age: userData.age,
            gender: userData.gender,
          }),
        },
      });
    } else {
      survey = await db.surveyResponse.create({
        data: {
          sessionId,
          completed: completed ?? false,
          ...(userData && {
            name: userData.name,
            address: userData.address,
            age: userData.age,
            gender: userData.gender,
          }),
        },
      });
    }

    // Save answers if provided
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        const existingAnswer = await db.answer.findUnique({
          where: {
            surveyId_symptomId: {
              surveyId: survey.id,
              symptomId: answer.symptomId,
            },
          },
        });

        if (existingAnswer) {
          await db.answer.update({
            where: { id: existingAnswer.id },
            data: {
              frequency: answer.frequency,
              impactAreas: JSON.stringify(answer.impactAreas),
              duration: answer.duration,
            },
          });
        } else {
          await db.answer.create({
            data: {
              surveyId: survey.id,
              symptomId: answer.symptomId,
              category: answer.category,
              frequency: answer.frequency,
              impactAreas: JSON.stringify(answer.impactAreas),
              duration: answer.duration,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, surveyId: survey.id });
  } catch (error) {
    console.error('Survey save error:', error);
    return NextResponse.json({ error: 'Failed to save survey' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const survey = await db.surveyResponse.findUnique({
      where: { sessionId },
      include: { answers: true },
    });

    if (!survey) {
      return NextResponse.json({ exists: false });
    }

    const answers = survey.answers.map(a => ({
      symptomId: a.symptomId,
      category: a.category,
      frequency: a.frequency,
      impactAreas: JSON.parse(a.impactAreas),
      duration: a.duration,
    }));

    return NextResponse.json({
      exists: true,
      completed: survey.completed,
      answers,
      userData: {
        name: survey.name,
        address: survey.address,
        age: survey.age,
        gender: survey.gender,
      },
    });
  } catch (error) {
    console.error('Survey fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    await db.surveyResponse.delete({
      where: { sessionId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
