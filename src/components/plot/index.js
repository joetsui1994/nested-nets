import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import MovingSeries from './movingSeries';

const useStyles = makeStyles({
    root: {
        background: '#375466',
        marginLeft: 15,
        marginTop: 0,
        margin: 10,
        width: 914,
        height: 210,
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
    }
});
  
function PlotPanel(props) {
    const classes = useStyles();


    return (
        <Box className={classes.root}>
            <div className={classes.title}>
                JUMP-PLOT
            </div>
            <MovingSeries {...props} />
        </Box>
    )
}

export default PlotPanel;