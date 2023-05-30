import { Fragment } from 'react';
import { makeStyles } from '@mui/styles';

import ReadMe from './readme';

const useStyles = makeStyles({
    root: {
        color: '#A8DADC',
        textAlign: 'left',
        fontSize: 14,
        fontWeight: 700,
        opacity: 0.9,
        padding: 10,
        paddingLeft: 15,
        paddingBottom: 0,
    },
    version: {
        color: '#457B9D',
        textAlign: 'left',
        fontSize: 10,
        fontWeight: 800,
        paddingLeft: 15
    },
    info: {
        color: '#F1FAEE',
        textAlign: 'left',
        fontSize: 9,
        fontStyle: 'italic',
        fontWeight: 500,
        opacity: 0.5,
        paddingLeft: 5,
    }
});
  
function Header() {
    const classes = useStyles();

    return (
        <Fragment>
            <div className={classes.root}>
                <span style={{ fontSize: 8 }}>(SELF)</span>EXCITING-NETWORK
                <ReadMe />
            </div>
            <div className={classes.version}>
                v1.1.2
                <span className={classes.info}>
                    (created by J.Tsui)
                </span>
            </div>
        </Fragment>
    )
}

export default Header;