import { ErrorCode } from "@/services/information/errors";
import type { PendingQuestion } from "@/services/information/types";
import { useSessionStore } from "@/store/sessionStore";
export function TestErrorNotifyModal() {
  const questions = useSessionStore((s) => s.decisions);
  const notifications = useSessionStore((s) => s.notifications);
  const removeNotification = useSessionStore((s) => s.removeNotification);
  const removeQuestion = useSessionStore((s) => s.removeDecision);

  const currentQuestion = questions.at(-1);
  const currentNotification = notifications.at(-1);

  const answerQuestion = (question: PendingQuestion, choice: boolean) => {
    question.resolve({
      id: question.id,
      contextId: question.contextId,
      error: question.error,
      choice,
      params: question.params,
    });
    removeQuestion(question.id);
  };

  const messageTitles = {
    [ErrorCode.DecisionContextAborted]: "Задача отменена",
    [ErrorCode.ParsingError]: "Ошибка парсинга",
  }; //toDo: add more specific error/warning/success types
  return (
    (currentQuestion || currentNotification) && (
      <div
        style={{
          backgroundColor: "blanchedalmond",
          zIndex: 10000,
          height: "100px",
          width: "1000px",
          color: "black",
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          padding: "10px 30px",
          justifyContent: "space-between",
        }}
      >
        {currentNotification && (
          <div>
            <h1>{currentNotification.code}</h1>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {currentNotification.createdAt}
            </p>
          </div>
        )}
        {currentQuestion && (
          <div>
            <h1>{currentQuestion.error.name}</h1>
            <p>{currentQuestion.error.message}</p>
            <div>
              <button
                type="button"
                onClick={() => answerQuestion(currentQuestion, true)}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => answerQuestion(currentQuestion, false)}
              >
                Skip
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            if (currentNotification) {
              removeNotification(currentNotification.id);
              return;
            }
            if (currentQuestion) answerQuestion(currentQuestion, false);
          }}
        >
          X
        </button>
        {currentQuestion && (
          <button type="button" onClick={() => currentQuestion.reject()}>
            Отменить
          </button>
        )}
      </div>
    )
  );
}
