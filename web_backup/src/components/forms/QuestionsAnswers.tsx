import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Question {
  answer: boolean;
  details?: string;
}

interface QuestionsAnswersData {
  question34: Question;
  question35: Question;
  question36: Question;
  question37: Question;
  question38: Question;
  question39: Question;
  question40: Question;
}

const QuestionsAnswers: React.FC = () => {
  const { register, watch, formState: { errors } } = useFormContext<{ questionsAnswers: QuestionsAnswersData }>();

  const questions = [
    {
      id: 'question34',
      number: '34',
      text: 'Are you related by consanguinity or affinity to the appointing or recommending authority, or to the chief of bureau or office or to the person who has immediate supervision over you in the Office, Bureau or Department where you will be appointed,',
      subText: 'a. within the third degree?',
      subText2: 'b. within the fourth degree (for Local Government Unit - Career Employees)?',
    },
    {
      id: 'question35',
      number: '35',
      text: 'a. Have you ever been found guilty of any administrative offense?',
      subText: 'b. Have you been criminally charged before any court?',
    },
    {
      id: 'question36',
      number: '36',
      text: 'Have you ever been convicted of any crime or violation of any law, decree, ordinance or regulation by any court or tribunal?',
    },
    {
      id: 'question37',
      number: '37',
      text: 'Have you ever been separated from the service in any of the following modes: resignation, retirement, dropped from the rolls, dismissal, termination, end of term, finished contract or phased out (abolition) in the public or private sector?',
    },
    {
      id: 'question38',
      number: '38',
      text: 'a. Have you ever been a candidate in a national or local election held within the last year (except Barangay election)?',
      subText: 'b. Have you resigned from the government service during the three (3)-month period before the last election to promote/actively campaign for a national or local candidate?',
    },
    {
      id: 'question39',
      number: '39',
      text: 'Have you acquired the status of an immigrant or permanent resident of another country?',
    },
    {
      id: 'question40',
      number: '40',
      text: 'Pursuant to: (a) Indigenous People\'s Act (RA 8371); (b) Magna Carta for Disabled Persons (RA 7277); and (c) Solo Parents Welfare Act of 2000 (RA 8972), please answer the following items:',
      subText: 'a. Are you a member of any indigenous group?',
      subText2: 'b. Are you a person with disability?',
      subText3: 'c. Are you a solo parent?',
    },
  ];

  return (
    <div className="questions-answers-form">
      <h2>IX. QUESTIONS</h2>
      <p className="form-instruction">
        (Answer each question by putting a check mark (✓) on the appropriate box. 
        If your answer is YES, give details on the space provided.)
      </p>

      {questions.map((question) => {
        const watchAnswer = watch(`questionsAnswers.${question.id}.answer` as any);

        return (
          <div key={question.id} className="question-section">
            <div className="question-header">
              <span className="question-number">{question.number}.</span>
              <div className="question-text">
                <p>{question.text}</p>
                {question.subText && <p className="sub-text">{question.subText}</p>}
                {question.subText2 && <p className="sub-text">{question.subText2}</p>}
                {question.subText3 && <p className="sub-text">{question.subText3}</p>}
              </div>
              <div className="answer-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register(`questionsAnswers.${question.id}.answer` as const, {
                      required: 'Please answer this question',
                    })}
                    value="true"
                  />
                  YES
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register(`questionsAnswers.${question.id}.answer` as const, {
                      required: 'Please answer this question',
                    })}
                    value="false"
                  />
                  NO
                </label>
              </div>
            </div>

            {watchAnswer === 'true' && (
              <div className="details-section">
                <label htmlFor={`${question.id}-details`} className="details-label">
                  If YES, give details:
                </label>
                <textarea
                  id={`${question.id}-details`}
                  {...register(`questionsAnswers.${question.id}.details` as const, {
                    required: watchAnswer === 'true' ? 'Please provide details' : false,
                  })}
                  className="details-textarea"
                  rows={3}
                  placeholder="Please provide details..."
                />
                {errors.questionsAnswers?.[question.id as keyof QuestionsAnswersData]?.details && (
                  <span className="error-message">
                    {errors.questionsAnswers[question.id as keyof QuestionsAnswersData].details?.message}
                  </span>
                )}
              </div>
            )}

            {errors.questionsAnswers?.[question.id as keyof QuestionsAnswersData]?.answer && (
              <span className="error-message">
                {errors.questionsAnswers[question.id as keyof QuestionsAnswersData].answer?.message}
              </span>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .questions-answers-form {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        h2 {
          color: #333;
          margin-bottom: 10px;
          font-size: 20px;
          font-weight: bold;
        }

        .form-instruction {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
          font-style: italic;
        }

        .question-section {
          margin-bottom: 25px;
          padding: 20px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .question-header {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }

        .question-number {
          font-weight: bold;
          color: #333;
          font-size: 16px;
          min-width: 30px;
        }

        .question-text {
          flex: 1;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }

        .question-text p {
          margin: 0 0 5px 0;
        }

        .sub-text {
          margin-left: 20px;
          font-size: 13px;
        }

        .answer-options {
          display: flex;
          gap: 20px;
          margin-left: 20px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }

        .radio-label input[type="radio"] {
          cursor: pointer;
        }

        .details-section {
          margin-top: 15px;
          margin-left: 45px;
        }

        .details-label {
          display: block;
          font-size: 14px;
          color: #555;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .details-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.3s;
        }

        .details-textarea:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
        }

        .error-message {
          display: block;
          color: #f44336;
          font-size: 12px;
          margin-top: 5px;
          margin-left: 45px;
        }
      `}</style>
    </div>
  );
};

export default QuestionsAnswers;