import { makeStyles } from '@mui/styles';
import React, { useState, useEffect, useRef } from 'react';

import Header from './components/header';
import SettingsPanel from './components/settings';
import GraphPanel from './components/graph';
import PlotPanel from './components/plot';
import params from './params';

const useStyles = makeStyles({
  root: {
    textAlign: 'left',
    background: '#282c34',
    height: '100vh',
    width: '100%',
    minWidth: 950,
    minHeight: 740
  }
});

const transitionSeriesMax = 70;

function App() {
  const classes = useStyles();

  const [simulationActive, setSimulationActive] = useState(false);
  const toggleSimulation = (active) => {
    setSimulationActive(active ?? !simulationActive);
  }

  const [restartTrigger, setRestartTrigger] = useState(null);
  const triggerRestartHandler = () => {
    setRestartTrigger(restartTrigger === null ? false : !restartTrigger);
    setTransitionSeries([{ time: 0, val: 0 }]); // reset transitionSeries
    // save all settings
    setTimeDelta(preSaveTimeDelta);
    setAmbientTemp(preSaveAmbientTemp);
    setImmobility(preSaveImmobility);
    setSelfRadius(preSaveSelfRadius);
    setDistScaling(preSaveDistScaling);
    // reset something-has-changed
    setSettingsChanged(false);
  }

  const [elapsedTime, setElapsedTime] = useState(0);
  const previousTimeRef = useRef(null);
  useEffect(() => {
    if (simulationActive) {
      previousTimeRef.current = performance.now();

      const intervalId = setInterval(() => {
        const currentTime = performance.now();
        const timeDifference = currentTime - previousTimeRef.current;
        setElapsedTime((prevElapsedTime) => prevElapsedTime + timeDifference);
        previousTimeRef.current = currentTime;
      }, 10); // update every 10 milliseconds
  
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [simulationActive]);
  useEffect(() => {
    if (previousTimeRef.current !== null & restartTrigger !== null) {
      setElapsedTime(0);
    }
  }, [restartTrigger]);

  const [transitionSeries, setTransitionSeries] = React.useState([{ time: 0, val: 0 }]);
  const handleTransitionUpdate = (newTransitionFreq) => {
    const newTransitionSeries = transitionSeries.length >= transitionSeriesMax ? transitionSeries.slice(1) : [...transitionSeries];
    newTransitionSeries.push(newTransitionFreq);
    setTransitionSeries(newTransitionSeries);
  };

  const [resetDefaultTrigger, setResetDefaultTrigger] = useState(false);
  const handleResetDefaultsOnClick = () => {
    setResetDefaultTrigger(!resetDefaultTrigger);
  };
  useEffect(() => {
    setPreSaveTimeDelta(params.defaultTimeDelta)
    setPreSaveAmbientTemp(params.defaultAmbientTemp)
    setPreSaveImmobility(params.defaultImmobility);
    setPreSaveSelfRadius(params.defaultSelfRadius);
    setPreSaveDistScaling(params.defaultDistScaling);
    setSettingsChanged(
      timeDelta !== params.defaultTimeDelta ||
      ambientTemp !== params.defaultAmbientTemp ||
      immobility !== params.defaultImmobility ||
      selfRadius !== params.defaultSelfRadius ||
      distScaling !== params.defaultDistScaling
    );
  }, [resetDefaultTrigger]);

  const [settingsChanged, setSettingsChanged] = useState(false);

  const [timeDelta, setTimeDelta] = React.useState(params.defaultTimeDelta);
  const [preSaveTimeDelta, setPreSaveTimeDelta] = React.useState(timeDelta);
  const handleTimeDeltaOnChange = (event, val) => {
    setPreSaveTimeDelta(val);
    setSettingsChanged(val !== timeDelta);
  };

  const [ambientTemp, setAmbientTemp] = React.useState(params.defaultAmbientTemp);
  const [preSaveAmbientTemp, setPreSaveAmbientTemp] = React.useState(ambientTemp);
  const handleAmbientTempOnChange = (event, val) => {
    setPreSaveAmbientTemp(val);
    setSettingsChanged(val !== ambientTemp);
  };

  const [immobility, setImmobility] = React.useState(params.defaultImmobility);
  const [preSaveImmobility, setPreSaveImmobility] = React.useState(immobility);
  const handleImmobilityOnChange = (event, val) => {
    setPreSaveImmobility(val);
    setSettingsChanged(val !== immobility);
  };

  const [selfRadius, setSelfRadius] = React.useState(params.defaultSelfRadius);
  const [preSaveSelfRadius, setPreSaveSelfRadius] = React.useState(selfRadius);
  const handleSelfRadiusOnChange = (event, val) => {
    setPreSaveSelfRadius(val);
    setSettingsChanged(val !== selfRadius);
  };

  const [distScaling, setDistScaling] = React.useState(params.defaultDistScaling);
  const [preSaveDistScaling, setPreSaveDistScaling] = React.useState(distScaling);
  const handleDistScalingOnChange = (event, val) => {
    setPreSaveDistScaling(val);
    setSettingsChanged(val !== distScaling);
  };

  return (
    <div className={classes.root}>
      <Header />
      <div>
        <SettingsPanel
          toggleSimulation={toggleSimulation}
          simulationActive={simulationActive}
          triggerRestartHandler={triggerRestartHandler}
          timeDelta={preSaveTimeDelta}
          handleTimeDeltaOnChange={handleTimeDeltaOnChange}
          ambientTemp={preSaveAmbientTemp}
          handleAmbientTempOnChange={handleAmbientTempOnChange}
          immobility={preSaveImmobility}
          handleImmobilityOnChange={handleImmobilityOnChange}
          selfRadius={preSaveSelfRadius}
          handleSelfRadiusOnChange={handleSelfRadiusOnChange}
          distScaling={preSaveDistScaling}
          handleDistScalingOnChange={handleDistScalingOnChange}
          handleResetDefaultsOnClick={handleResetDefaultsOnClick}
          settingsChanged={settingsChanged}
        />
        <GraphPanel
          toggleSimulation={toggleSimulation}
          simulationActive={simulationActive}
          triggerRestartHandler={triggerRestartHandler}
          restartTrigger={restartTrigger}
          time={elapsedTime}
          handleTransitionUpdate={handleTransitionUpdate}
          timeDelta={timeDelta}
          ambientTemp={ambientTemp}
          immobility={immobility}
          selfRadius={selfRadius}
          distScaling={distScaling}
        />
      </div>
      <PlotPanel
        transitionSeries={transitionSeries}
        transitionSeriesMax={transitionSeriesMax}
        timeDelta={timeDelta}
        restartTrigger={restartTrigger}
      />
    </div>
  );
}

export default App;
