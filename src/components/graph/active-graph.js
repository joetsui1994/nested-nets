import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";

import Tree from '../../test-data/trial_v2_fxy_v1.json';
import TreeDistMat from '../../test-data/trial_v2_v1_distMat_2D.json';
import TreeS from '../../test-data/trial_small-world_ws_v1.json';
import staticParams from './static-params';
import activeParams from './active-params';

// make deep copy of Tree for restart
const Tree_Copy = JSON.parse(JSON.stringify(Tree));

// make deep copy of TreeS for restart
const TreeS_Copy = JSON.parse(JSON.stringify(TreeS));

// function to generate random integer within a certain range
function getRandomInt(min, max) {
    min = Math.ceil(min); // Round up the minimum value
    max = Math.floor(max); // Round down the maximum value
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to randomly assign particles to environmental nodes at start
// and create new links
function assignParticleLoc(tree, treeS) {
    var sourceNodes = [];
    const newLinks = treeS.nodes.map(d => {
        const sourceNodeId = tree.nodes[getRandomInt(0, tree.nodes.length - 1)].id;
        sourceNodes.push(sourceNodeId);
        const newLinkId = `${sourceNodeId}_${d.id}`;
        return ({
            id: newLinkId,
            source: sourceNodeId,
            target: d.id,
            len: 0.7,
            type: 2
        });
    });
    // add loc in node objects
    treeS.nodes = treeS.nodes.map((d, i) => ({ ...d, loc: sourceNodes[i] }));

    return (newLinks);
};

// function to calculate probability of next travel location
function calculateNextLocP(pId, tree, treeS, props) {
    // extract precomputed metadata of current node
    const { nbws } = treeS.nodes.find(d => d.id == pId);

    // find where current particle is located
    const pLoc = treeS.nodes.find(d => d.type === 2 && d.id === pId).loc;

    // find where all connected particles are located and relevant distances and weights
    const allConnectedPs = tree.nodes.filter(d => d.type === 2 && (d.id in nbws));
    const locNbwMap = {};
    allConnectedPs.forEach(d => {
        const connedtedP = treeS.nodes.find(n => d.id === d.id);
        if (connedtedP.loc in locNbwMap) {
            locNbwMap[connedtedP.loc].push(nbws[d.id]);
        } else {
            locNbwMap[connedtedP.loc] = [nbws[d.id]];
        }
    });

    // background probability (from ambient temperature) of moving to any node (scaled by distance)
    // regardless of presence of connected particles
    const locProbMap = {};
    tree.nodes.filter(d => d.type === 1).forEach(d => {
        // calculate shortest path distance from pLoc
        const locDist = TreeDistMat[parseInt(pLoc)][parseInt(d.id)];

        // check if any connected particles are located in this location currently
        var locWsSum = 0;
        if (parseInt(d.id) in locNbwMap) {
            const allLocWs = locNbwMap[d.id];
            locWsSum = allLocWs.reduce((pSum, w) => pSum + w, 0);
        }
        
        // if considering pLoc (self-gravitation)
        if (d.id === pLoc) {
            locProbMap[d.id] = (locWsSum + props.immobility)*props.localAttraction;
        } else { // if not
            // add ambient temperature
            locProbMap[d.id] = (locWsSum + props.ambientTemp)/(locDist**props.distScaling);
        }
    });

    // normalise probabilities
    const probSum = Object.values(locProbMap).reduce((pSum, p) => pSum + p, 0);
    const locProbNormMap = {};
    Object.entries(locProbMap).forEach(([k, v]) => {
        locProbNormMap[k] = v/probSum;
    });

    return({ pLoc: pLoc, locProb: locProbNormMap });
};

// perform weighted random sampling of next loc
function weightedLocSample(pId, pLoc, ws, tree, treeS, simulationRef) {
    // generate random number between 0 and 1
    const randomNum = Math.random(); // total weight already 1

    // perform weighted sampling
    let accWs = 0;
    const sampledLoc = Object.entries(ws).reduce((result, [k, v]) => {
        accWs += v;
        return result || (randomNum <= accWs ? k : null);
    }, null);

    // check if there is a transition
    const p = tree.nodes.find(d => d.id == pId);
    const isTransitioned = sampledLoc.toString() !== pLoc;

    // update tree if transitioned
    if (isTransitioned) {
        const newLocId = tree.nodes.findIndex(d => d.type === 1 && d.id === sampledLoc.toString());
        tree.links = tree.links.map(d => ({ ...d, source: d.type === 2 && d.target.id === pId ? Tree.nodes[newLocId] : d.source }))
        const simulation = simulationRef.current;
        simulation
            .force('link')
            .links(tree.links);

        // update treeS
        treeS.nodes = treeS.nodes.map(d => ({ ...d, loc: d.id === pId ? Tree.nodes[newLocId].id : d.loc }));
    }

    return(isTransitioned);
}

// function to calculate radius of environmental nodes
function staticCalculateR(num, gamma=staticParams.node.gamma, maxR=staticParams.node.maxR, minR=staticParams.node.minR) {
	return minR + (maxR - minR)*(1 - Math.exp(-gamma*num));
};

// function to calculate radius of particles
function activeCalculateR(num, gamma=activeParams.node.gamma, maxR=activeParams.node.maxR, minR=activeParams.node.minR) {
	return minR + (maxR - minR)*(1 - Math.exp(-gamma*num));
};

// function to calculate acitve-link opacity based on r2
function activeLinkCalculateOpacity(r2, gamma=activeParams.link.gamma, maxOpacity=activeParams.link.maxOpacity, minOpacity=activeParams.link.minOpacity) {
	return minOpacity + (maxOpacity - minOpacity)*(1 - Math.exp(-gamma*r2));
};

function ActiveGraph(props) {
    const canvasRef = React.useRef(null);

    const { toggleSimulation, simulationActive, restartTrigger, time, handleTransitionUpdate, timeDelta } = props;

    const mountedRef = React.useRef(false);
    const simulationRef = React.useRef(null);

    const previousTimeStep = useRef(null);
    useEffect(() => {
        const newTimeStep = Math.floor(time/timeDelta);
        let transitionFreq = 0;
        if (mountedRef.current && newTimeStep !== previousTimeStep.current) {
            Tree.nodes.filter(d => d.type === 2).forEach(d => {
                const { pLoc, locProb } = calculateNextLocP(d.id, Tree, TreeS, props);
                const isTransitioned = weightedLocSample(d.id, pLoc, locProb, Tree, TreeS, simulationRef);
                transitionFreq += (isTransitioned ? 1 : 0)
            });
            handleTransitionUpdate({ time: newTimeStep*timeDelta, val: transitionFreq })    
        }
        previousTimeStep.current = newTimeStep;
    }, [time]);

    useEffect(() => {
        if (mountedRef.current) {
            const simulation = simulationRef.current;
            if (simulationActive) {
                simulation.alpha(1).restart();
            } else if (!simulationActive) {
                simulation.stop();
            }
        }
    }, [simulationActive]);

    useEffect(() => {
        if (mountedRef.current && restartTrigger !== null) {
            const simulation = simulationRef.current;
            const context = canvasRef.current.getContext('2d');
            context.clearRect(0, 0, staticParams.canvasWidth, staticParams.canvasHeight);

            // stop simulation and clear
            simulation.stop();
            simulation.nodes([]);

            // get clean Tree and TreeS for drawChart
            Tree = JSON.parse(JSON.stringify(Tree_Copy));
            TreeS = JSON.parse(JSON.stringify(TreeS_Copy));

            // restart simulation
            drawChart();
            toggleSimulation(true);
        }
    }, [restartTrigger]);

    useEffect(() => {
        if (!mountedRef.current) {
            drawChart(Tree);
            mountedRef.current = true;
            const simulation = simulationRef.current;
            toggleSimulation(true);    

            return (() => {
                simulation.stop();
            });    
        }
    }, []);

    const updateSimulation = () => {
        const context = canvasRef.current.getContext('2d');
        try {
            context.save();
            context.clearRect(0, 0, staticParams.canvasWidth, staticParams.canvasHeight);

            // Draw static-links
            Object.values(Tree.links).filter(d => d.type == 1).forEach(d => {
                const sourceX = d.source.y*staticParams.scaleF+staticParams.xOffset, sourceY = d.source.x*staticParams.scaleF+staticParams.yOffset;
                const targetX = d.target.y*staticParams.scaleF+staticParams.xOffset, targetY = d.target.x*staticParams.scaleF+staticParams.yOffset;

                context.beginPath();
                context.moveTo(sourceX, sourceY);
                context.lineTo(sourceX, sourceY);
                context.lineTo(targetX, targetY);

                context.globalAlpha = staticParams.link.opacity;

                context.strokeStyle = staticParams.link.color;
                context.lineWidth = staticParams.link.width;
                
                context.stroke();
            });
            
            // Draw static-nodes
            Object.values(Tree.nodes).filter(d => d.type == 1).sort((a, b) => a.num < b.num ? 1 : -1).forEach(d => {
                const nodeRadius = staticCalculateR(d.num), x = d.y*staticParams.scaleF+staticParams.xOffset, y = d.x*staticParams.scaleF+staticParams.yOffset;

                if (d.num) {
                    context.moveTo(x, y);
                    context.beginPath();
                    context.arc(x, y, nodeRadius, 0, 2*Math.PI);

                    context.globalAlpha = staticParams.node.opacity;

                    context.strokeStyle = staticParams.node.borderColor;
                    context.lineWidth = staticParams.node.borderWidth;
                    
                    context.stroke();

                    context.fillStyle = staticParams.node.backgroundColor;
                    context.fill();
                }
            });

            // Draw active-links
            Object.values(Tree.links).filter(d => d.type === 3).forEach(d => {
                const sourceX = d.source.y*activeParams.scaleF+activeParams.xOffset, sourceY = d.source.x*activeParams.scaleF+activeParams.yOffset;
                const targetX = d.target.y*activeParams.scaleF+activeParams.xOffset, targetY = d.target.x*activeParams.scaleF+activeParams.yOffset;

                const r2 = (targetX - sourceX)**2 + (targetY - sourceY)**2;
                const opacity = activeLinkCalculateOpacity(r2);

                context.beginPath();
                context.moveTo(sourceX, sourceY);
                context.lineTo(sourceX, sourceY);
                context.lineTo(targetX, targetY);

                context.globalAlpha = opacity;

                context.strokeStyle = activeParams.link.color;
                context.lineWidth = activeParams.link.width;
                
                context.stroke();
            });

            // Draw active-nodes
            Object.values(Tree.nodes).filter(d => d.type === 2).sort((a, b) => a.num < b.num ? 1 : -1).forEach(d => {
                const nodeRadius = activeCalculateR(d.num), x = d.y*activeParams.scaleF+activeParams.xOffset, y = d.x*activeParams.scaleF+activeParams.yOffset;

                if (d.num) {
                    context.moveTo(x, y);
                    context.beginPath();
                    context.arc(x, y, nodeRadius, 0, 2*Math.PI);

                    context.globalAlpha = activeParams.node.opacity;

                    context.strokeStyle = activeParams.node.borderColor;
                    context.lineWidth = activeParams.node.borderWidth;
                    
                    context.stroke();

                    context.fillStyle = activeParams.node.backgroundColor;
                    context.fill();
                }
            });
            context.restore();
        } catch (e) {
            console.error(e);
        }
    };

    function ticked() {
        // fix static background nodes
        Tree.nodes.forEach(node => {
            if (node.type === 1) {
                node.x = node.fxy.x;
                node.y = node.fxy.y;    
            }
        });

        this.force("charge", d3.forceManyBody().strength(d => d.type === 2 ? -0.0003 : 0))
            // .force("collide", d3.forceCollide().strength(0.01).radius(d => d.type === 2 ? 0.1 : 0))
            .force("link").iterations(6).strength(d => d.type === 3 ? 0 : 0.025);

        return updateSimulation();
    };

    const drawChart = () => {
        const canvas = document.getElementById('active');
        canvas.width = staticParams.canvasWidth;
        canvas.height = staticParams.canvasHeight;

        var simulation = d3
            .forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(d => d.len*staticParams.epsilon))
            .alphaDecay(0)
            .velocityDecay(0.6);

        simulationRef.current = simulation;

        // assign particles to environmental nodes and create new links
        const newLinks = assignParticleLoc(Tree, TreeS);
        // create new combined Tree object
        Tree.nodes = Tree.nodes.concat(TreeS.nodes);
        Tree.links = Tree.links.concat(newLinks).concat(TreeS.links);

        // add nodes to simulation and set up tick function
        simulation
            .nodes(Tree.nodes)
            .on('tick', ticked);
    
        // add links to simulation
        simulation
            .force('link')
            .links(Tree.links);

        // fix static background nodes
        Tree.nodes.forEach(node => {
            if (node.type === 1) {
                node.x = node.fxy.x;
                node.y = node.fxy.y;    
            }
        });

        // to stop simulation as soon as all nodes and links have been loaded
        simulation.stop();

        updateSimulation();
    };

    return (
        <canvas
            id='active'
            style={{ position: 'absolute', top: 30, left: 0 }}
            ref={canvasRef}
        />
    )
}

export default ActiveGraph;