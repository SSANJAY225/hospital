import style from './style/SuggestionList.module.css'
const SuggestionList = ({ suggestions, onSuggestionClick }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
      <div className={style.suggestions_dropdown}>
        <ul>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className={style.suggestion_item}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    );
  };

export default SuggestionList;