import React, { useEffect } from 'react';
import * as d3 from "d3";

import Tree from '../../test-data/trial_v2_fxy_v1.json';
import params from './static-params';

function calculate_r(num, gamma=params.node.gamma, maxR=params.node.maxR, minR=params.node.minR) {
	return minR + (maxR - minR)*(1 - Math.exp(-gamma*num));
};
  
function StaticGraph() {
    const canvasRef = React.useRef(null);

    useEffect(() => {
        drawChart();
        // mountedRef.current = true;
        // const simulation = simulationRef.current;

        // return (() => {
        //     simulation.stop();
        // });
    }, []);

    const updateSimulation = () => {

        const context = canvasRef.current.getContext('2d');

        try {
            context.save();
            context.clearRect(0, 0, params.canvasWidth, params.canvasHeight);

            // Draw links
            Object.values(Tree.links).forEach(d => {
                const sourceX = d.source.y*params.scaleF+params.xOffset, sourceY = d.source.x*params.scaleF+params.yOffset;
                const targetX = d.target.y*params.scaleF+params.xOffset, targetY = d.target.x*params.scaleF+params.yOffset;

                context.beginPath();
                context.moveTo(sourceX, sourceY);
                context.lineTo(sourceX, sourceY);
                context.lineTo(targetX, targetY);

                context.globalAlpha = params.link.opacity;

                context.strokeStyle = params.link.color;
                context.lineWidth = params.link.width;
                
                context.stroke();
            });

            // Draw nodes
            Object.values(Tree.nodes).sort((a, b) => a.num < b.num ? 1 : -1).forEach(d => {
                const nodeRadius = calculate_r(d.num), x = d.y*params.scaleF+params.xOffset, y = d.x*params.scaleF+params.yOffset;

                if (d.num) {
                    context.moveTo(x, y);
                    context.beginPath();
                    context.arc(x, y, nodeRadius, 0, 2*Math.PI);

                    context.globalAlpha = params.node.opacity;

                    context.strokeStyle = params.node.borderColor;
                    context.lineWidth = params.node.borderWidth;
                    
                    context.stroke();

                    context.fillStyle = params.node.backgroundColor;
                    context.fill();
                }
            });
            context.restore();
        } catch (e) {
            console.error(e);
        }

    };

    const drawChart = () => {

        const canvas = document.getElementById('static');
        canvas.width = params.canvasWidth;
        canvas.height = params.canvasHeight;

        var simulation = d3
            .forceSimulation()
            .force('link', d3.forceLink().id(d => d.id));

        simulation
            .nodes(Tree.nodes);
    
        simulation
            .force('link')
            .links(Tree.links);

        // fix node coordinates to pre-specified xy
        Tree.nodes.forEach(node => {
            node.x = node.fxy.x;
            node.y = node.fxy.y;
        });

        // to stop simulation as soon as all nodes and links have been loaded
        simulation.stop();

        // draw nodes/links
        updateSimulation();

        simulation.nodes([])

    };

    return (
        <canvas
            id='static'
            style={{ position: 'absolute', top: 30, left: 0 }}
            // style={{ display: 'block' }}
            ref={canvasRef}
        />
    )
}

export default StaticGraph;