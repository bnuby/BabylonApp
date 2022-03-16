import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import VillageContainer from "./program/VillageContainer";

enum GameMode {
  Village = 'Village',
};

type ModeButtonProps = {mode: string, onClick: () => void, selected: boolean};
const ModeButton = ({mode, onClick, selected}:ModeButtonProps) => {
  return <div style={{
    cursor: 'pointer',
    marginRight: 5,
    padding: '5px 10px',
    borderRadius: 20,
    background: selected ? 'green' : '',
    border: '2px solid black',
  }}
  onClick={onClick}
  >
    {mode}
  </div>
}

const App = () => {
  const [currentMode, setMode] = useState<GameMode>(GameMode.Village);
  const cameraListRef = useRef<HTMLDivElement>(null);
  
  
  return (
    <>
    <div style={{
      margin: 10,
      height: 100,
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'start',
      justifyContent: 'flex-start'
    }}>
      {Object.values(GameMode).map(i => <ModeButton
        key={i}
        mode={i}
        onClick={() => setMode(i)}
        selected={i === currentMode}
      />)}
    </div>
    <div
      ref={cameraListRef}
      style={{
        margin: 10,
        height: 60,
        width: '100%',
        overflow: 'scroll',
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'flex-start',
      }}
    >
    </div>
    <div style={{
      width: '100vw',
      height: 'calc(100vh - 230px)'
    }}>
      {currentMode === GameMode.Village && (
        <VillageContainer cameraListRef={cameraListRef} />
      )}
    </div>
    </>
  );
};

export default App;