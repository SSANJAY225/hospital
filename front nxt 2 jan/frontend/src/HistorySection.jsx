import React from "react";
// import style from './style/PatientsForm.module.css';

const HistorySection = ({
  title,
  history,
  setHistory,
  inputValue,
  setInputValue,
  placeholder,
  handleAddHistoryItem,
  handleDeleteHistory,
  disabled,
  style,
}) => {
  return (
    <div className={style.history_section}>
      <h5>{title}</h5>

      <table className={style.responsive_table}>
        <tbody>
          {history.map((item, index) => (
            <tr key={index}>
              <td>{item}</td>
              <td>
                <button
                  className={`${style.buttondelete} ${style.responsive_button}`}
                  onClick={() =>
                    handleDeleteHistory(history, setHistory, item)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <input
        type="text"
        placeholder={placeholder}
        className={style.responsive_input}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddHistoryItem(inputValue, history, setHistory);
            setInputValue("");
          }
        }}
      />
    </div>
  );
};

export default HistorySection;
