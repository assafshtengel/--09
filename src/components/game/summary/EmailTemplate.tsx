interface EmailTemplateProps {
  playerName: string;
  opponent: string | null;
  actions: any[];
  actionLogs: any[];
  generalNotes: any[];
  insights: string;
  performanceRatings: Record<string, number>;
  havaya?: string[];
  questionsAnswers?: Record<string, string>;
}

export const generateEmailContent = ({
  playerName,
  opponent,
  actions,
  actionLogs,
  generalNotes,
  insights,
  performanceRatings,
  havaya = [],
  questionsAnswers = {},
}: EmailTemplateProps): string => {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h1 style="color: #1E40AF; font-size: 24px;">סיכום משחק - ${playerName}</h1>
      
      <div style="margin: 20px 0;">
        <h2 style="color: #2563eb;">פרטי המשחק</h2>
        ${opponent ? `<p>נגד: ${opponent}</p>` : ''}
      </div>

      ${havaya.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #4b5563;">הוויות נבחרות</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${havaya.map(h => `<li style="margin: 5px 0; padding: 8px; background-color: #f3f4f6; border-radius: 4px;">${h}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="margin: 20px 0;">
        <h3 style="color: #4b5563;">יעדים למשחק</h3>
        <ul style="list-style-type: none; padding: 0;">
          ${actions.map(action => `
            <li style="margin: 5px 0; padding: 8px; background-color: #f3f4f6; border-radius: 4px;">
              ${action.name}
              ${action.goal ? `<br><span style="font-size: 0.9em; color: #6b7280;">יעד: ${action.goal}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>

      ${Object.keys(questionsAnswers).length > 0 ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #4b5563;">תשובות לשאלות</h3>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${Object.entries(questionsAnswers).map(([question, answer]) => `
              <div style="margin-bottom: 12px;">
                <p style="font-weight: bold; margin-bottom: 4px;">${question}</p>
                <p style="color: #4b5563;">${answer}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${actionLogs.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #4b5563;">יומן פעולות</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${actionLogs.map(log => `
              <li style="margin: 5px 0;">
                דקה ${log.minute}: ${log.actionId} - ${log.result}
                ${log.note ? `<br>הערה: ${log.note}` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${generalNotes.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #4b5563;">הערות כלליות</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${generalNotes.map(note => `<li style="margin: 5px 0;">${note.text}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${insights ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #4b5563;">תובנות AI</h3>
          <p style="margin: 10px 0;">${insights}</p>
        </div>
      ` : ''}

      ${Object.keys(performanceRatings).length > 0 ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #4b5563;">דירוגי ביצועים</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${Object.entries(performanceRatings).map(([key, value]) => `
              <li style="margin: 5px 0;">${key}: ${value}/10</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
};