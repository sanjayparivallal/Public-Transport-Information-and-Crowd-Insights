import React from 'react';

/** Suggestion chips per role */
const CHIPS = {
  commuter: [
    'Tell me the bus from Chennai to Salem',
    'Tell me the bus from Chennai to Karur',
    'What is the fare from Salem to Erode?',
    'Show stops for route CHN-001',
    'Are there any trains from Madurai to Dindigul?',
  ],
  driver: [
    'Show my assigned bus',
    'I have started my shift',
    'Bus is delayed by 10 minutes',
    'Which bus goes from Chennai to Vellore?',
    'What stops does my route have?',
  ],
  conductor: [
    'Show my assigned bus',
    'I have started my shift',
    'Bus is currently at stop 3',
    'How many seats are available?',
    'Which bus goes from Salem to Krishnagiri?',
  ],
  authority: [
    'Show all open incidents',
    'Show crowd reports',
    'Add a new transport',
    'Pause transport SLM-001',
    'Show routes from Chennai',
  ],
};

/**
 * Role-aware quick-action suggestion chips.
 * Clicking a chip calls onChipClick with the chip text.
 */
const QuickChips = ({ role, onChipClick }) => {
  const chips = CHIPS[role] || CHIPS.commuter;

  return (
    <div className="px-3 py-2 flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onChipClick(chip)}
          className="
            text-xs px-3 py-1.5 rounded-full border
            border-indigo-500/40 bg-indigo-500/10
            text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/60
            transition-all duration-150 active:scale-95
            whitespace-nowrap
          "
        >
          {chip}
        </button>
      ))}
    </div>
  );
};

export default QuickChips;
