import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import CustomSlider from './slider';
import ResetButton from './reset';
import params from '../../params';

const useStyles = makeStyles({
    root: {
        verticalAlign: 'top',
        textAlign: 'center',
        background: '#375466',
        marginLeft: 15,
        marginRight: -5,
        margin: 10,
        width: 300,
        height: '100vh',
        maxHeight: 450,
        border: '2px solid #457B9D',
        borderRadius: 4,
        display: 'inline-block'
    },
    title: {
        textAlign: 'right',
        marginBottom: 5,
        padding: 6,
        paddingRight: 10,
        color: '#A8DADC',
        opacity: 0.7,
        fontSize: 12,
        fontWeight: 900
    },
    panel: {
        padding: 10,
        marginTop: 5,
        paddingBottom: 0,
        color: '#A8DADC',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'left'
    }
});

const CustomButton = styled(Button)({
    boxShadow: 'none',
    textTransform: 'none',
    width: '95%',
    margin: 3,
    fontSize: 12,
    fontWeight: 500,
    color: '#A8DADC',
    opacity: 0.8,
    lineHeight: 1.5,
    padding: '6px 12px',
    backgroundColor: '#46667a',
    border: '2px solid #1D3557',
    '&:hover': {
        backgroundColor: '#3f6175',
        border: '2px solid #1D3557',
        boxShadow: 'none',
    },
});  

function SettingsPanel(props) {
    const classes = useStyles();

    const { simulationActive, toggleSimulation, triggerRestartHandler, handleResetDefaultsOnClick, settingsChanged } = props;
    const { timeDelta, handleTimeDeltaOnChange } = props;
    const { ambientTemp, handleAmbientTempOnChange } = props;
    const { immobility, handleImmobilityOnChange } = props;
    const { selfRadius, handleSelfRadiusOnChange } = props;
    const { distScaling, handleDistScalingOnChange } = props;

    const _onRestart = () => {
        toggleSimulation(false);
        triggerRestartHandler();
    };

    return (
        <Box className={classes.root}>
            <div className={classes.title}>
                ACTIONS/SETTINGS
            </div>
            <CustomButton
                disableRipple={true}
                variant="outlined"
                style={{
                    background: simulationActive ? '#E63946' : '#46667a',
                    color: simulationActive ? '#000' : '#A8DADC',
                    fontWeight: simulationActive ? 900 : 700
                }}
                onClick={() => toggleSimulation()}
            >
                {simulationActive ? 'Pause' : 'Resume'}
            </CustomButton>
            <CustomButton
                disableRipple={true}
                variant="outlined"
                style={{ color: '#bf0f1d', fontWeight: 900 }}
                onClick={_onRestart}
            >
                Restart <span style={{ color: settingsChanged ? '#fff' : '#484848', opacity: settingsChanged ? 0.9 : 0.4 }}>&nbsp;(to apply changes)</span>
            </CustomButton>
            <div className={classes.panel} style={{ marginTop: 5 }}>
                Size of time-step (milliseconds):
                <div style={{ textAlign: 'center' }}>
                    <CustomSlider
                        value={timeDelta}
                        defaultValue={params.defaultTimeDelta}
                        step={100}
                        min={200}
                        max={3000}
                        onChangeHandler={handleTimeDeltaOnChange}
                    />
                </div>
            </div>
            <div className={classes.panel}>
                Ambient (particle) temperature:
                <div style={{ textAlign: 'center' }}>
                    <CustomSlider
                        value={ambientTemp}
                        defaultValue={params.defaultAmbientTemp}
                        step={0.001}
                        min={0}
                        max={1}
                        onChangeHandler={handleAmbientTempOnChange}
                    />
                </div>
            </div>
            <div className={classes.panel}>
                Immobility-level (tendency to remain):
                <div style={{ textAlign: 'center' }}>
                    <CustomSlider
                        value={immobility}
                        defaultValue={params.defaultImmobility}
                        step={0.01}
                        min={0}
                        max={10}
                        onChangeHandler={handleImmobilityOnChange}
                    />
                </div>
            </div>
            <div className={classes.panel}>
                Local attraction (importance of local ties):
                <div style={{ textAlign: 'center' }}>
                    <CustomSlider
                        value={1/selfRadius}
                        defaultValue={params.defaultSelfRadius}
                        step={0.1}
                        min={0.001}
                        max={500}
                        onChangeHandler={handleSelfRadiusOnChange}
                    />
                </div>
            </div>
            <div className={classes.panel}>
                Distance scaling (lambda):
                <div style={{ textAlign: 'center' }}>
                    <CustomSlider
                        value={distScaling}
                        defaultValue={params.defaultDistScaling}
                        step={0.001}
                        min={0.001}
                        max={3}
                        onChangeHandler={handleDistScalingOnChange}                    
                    />
                </div>
            </div>
            <ResetButton
                handleResetDefaultsOnClick={handleResetDefaultsOnClick}
            />
        </Box>
    )
}

export default SettingsPanel;