import '../App.css';

import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Latex from "react-latex-next";

const useStyles = makeStyles({
    root: {
        display: 'inline-block',
    },
    dialogContent: {
        minWidth: 500,
        maxHeight: 500,
        fontSize: 13,
    }
});

const OpenButton = styled(Button)({
    boxShadow: 'none',
    fontSize: 11,
    fontWeight: 900,
    textAlign: 'right',
    display: 'inline-block',
    lineHeight: 0.5,
    verticalAlign: 'top',
    marginLeft: 5,
    paddingLeft: 5,
    paddingRight: 5,
    color: '#9e9e9e',
    '&:hover': {
        boxShadow: 'none',
        opacity: 0.8,
    }
});

const CloseButton = styled(Button)({
    boxShadow: 'none',
    fontSize: 12,
    fontWeight: 900,
    display: 'inline-block',
    lineHeight: 1.5,
    background: 'light grey',
    padding: 5,
    opacity: 0.8,
    color: '#484848',
    '&:hover': {
        boxShadow: 'none',
        opacity: 1,
    }
});
  
function ReadMe() {
    const classes = useStyles();

    const [dialogOpen, setDialogOpen] = useState(false);
    const _openDialog = () => {
        setDialogOpen(true);
    };
    const _closeDialog = () => {
        setDialogOpen(false);
    };

    return (
        <div className={classes.root}>
            <OpenButton
                variant='outlined'
                onClick={_openDialog}
            >
                READ.ME
            </OpenButton>
            <Dialog onClose={_closeDialog} open={dialogOpen}>
                <DialogTitle style={{ fontSize: 15, fontWeight: 800 }}>READ.ME</DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    This a simulation of the self-excitatory nature of the movements of a social network in discrete spacetime. There are two major components in
                    this simulation setup: (1) the social network, as represented by the red nodes/links, and (2) the environmental network (or just the environment) in
                    which the social network can move around, as represented by the white nodes/links. It is assumed that the environmental network is time-invariant; although
                    the topology (both the connections and the weight of each connection) of the social network is also time-invariant, the position of each node is allowed to
                    change over time (see later for more details). The size of each node is proportional to the degree of the node. The social network is randomly generated using
                    the <span style={{ fontFamily: 'Courier' }}>watts_strogatz_graph</span> method in networkx. Each link (connecting two nodes A and B) is assigned a weight
                    according to the function: <br /><br />
                    <div style={{ width: '100%', textAlign: 'center' }}><Latex>{`$w(A,B)=w(k_A, k_B)=k_A k_B/(k_A + k_B)$`}</Latex></div><br />
                    where <Latex>$k_A$</Latex> and <Latex>$k_B$</Latex> are the degree of node A and B respectively. This function has the property that <Latex>$w(k_A, k_B)$</Latex> is
                    large only when both <Latex>$k_A$</Latex> and <Latex>$k_B$</Latex> are large and increases with both <Latex>$k_A$</Latex> and <Latex>$k_B$</Latex>. This is to simulate
                    the strength of a social connection between two individuals as a function of their degrees of connection to the rest of the social network, with the connection being stronger
                    when both individuals are strongly connected to others and less so when one individual is isolated (not sure if this is actually realistic).<br /><br />
                    At the beginning of the simulation, each particle in the social network is randomly assigned to an environmental node. The particles must remain
                    in their corresponding environmental node until the next "jump" (at regular intervals of <Latex>$\Delta t$</Latex>). At each jump,
                    each particle could either (1) remain in the same node, or (2) move to another node, anywhere in the social network. Suppose that a particle A is at
                    node <Latex>$i$</Latex> at some time <Latex>$t$</Latex>, the probability of (1) is proportional to:
                    <br /><br />
                    <div style={{ width: '100%', textAlign: 'center' }}><Latex>{`$p(i \\rightarrow i)=[w_0 + \\sum_{R \\in P_{A,i}} w(A,R)]/d_0$`}</Latex></div><br />
                    where <Latex>{`$P_{A,i}$`}</Latex> is the set of particles that are connected to particle A in the social network and are located at node <Latex>$i$</Latex> at time <Latex>$t$</Latex>,<span>&nbsp;</span>
                    <Latex>$w_0$</Latex> is the immobility-level which determines the tendency of a particle to remain static regardless of the location of its connected particles, and <Latex>$d_0$</Latex> is
                    the local-attraction which determines the importance of social connections to particles that are located in the same node. The more connected particles there are located in the same node,
                    the more likely that the particle will remain static. The larger <Latex>$w_0$</Latex> is, however, the more likely that a particle will remain static even if there are no local social connections.<br /><br />
                    Conditioned on (2), the probability that the particle A will move to a node <Latex>$j \neq i$</Latex> at the next jump is proportional to:<br /><br />
                    <div style={{ width: '100%', textAlign: 'center' }}><Latex>{`$p(i \\rightarrow j)=[w_T + \\sum_{R \\in P_{A,j}} w(A,R)]/d^\\lambda(i,j)$`}</Latex></div><br />
                    where <Latex>{`$P_{A,j}$`}</Latex> is the set of particles that are connected to particle A in the social network and are located in node <Latex>$j$</Latex> at time <Latex>$t$</Latex>, and <Latex>$d(i,j)$</Latex> is
                    the distance between node <Latex>$i$</Latex> and node <Latex>$j$</Latex> (with distance being the length of the shortest path connecting the two nodes). The exponent <Latex>$\lambda$</Latex> determines
                    how the probability scales with distance, with jumps over long distances being more likely when <Latex>$\lambda$</Latex> is small, and vice versa. <Latex>$w_T$</Latex> is known as the ambient temperature term which determines
                    the tendency of a particle to explore a new node regardless of whether there are connected particles. The probability of (2) is therefore proportional to the sum of <Latex>$p(i \rightarrow j)$</Latex> for
                    all <Latex>$j \neq i$</Latex>.
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <CloseButton onClick={_closeDialog}>CLOSE</CloseButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ReadMe;