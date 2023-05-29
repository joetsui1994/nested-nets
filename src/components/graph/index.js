import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';

import ActiveGraph from './active-graph';

const useStyles = makeStyles({
    root: {
        verticalAlign: 'top',
        background: '#375466',
        marginLeft: 15,
        margin: 10,
        height: 450,
        width: 600,
        border: '2px solid #457B9D',
        borderRadius: 4,
        display: 'inline-block',
        position: 'relative'
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
    timer: {
        fontSize: 11,
        fontWeight: 500,
        fontFamily: 'Courier',
    }
});

const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};
  
function GraphPanel(props) {
    const classes = useStyles();

    const { time } = props;

    return (
        <Box className={classes.root}>
            <div className={classes.title}>
                <span className={classes.timer}>(mm:ss.SS){formatTime(time)}</span> SIMULATION
            </div>
            <ActiveGraph {...props} />
        </Box>
    )
}

export default GraphPanel;