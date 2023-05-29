import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import * as d3 from "d3";

import params from './params';

const useStyles = makeStyles({
    root: {
        background: '#375466',
        marginLeft: 15,
        marginTop: 0,
        margin: 10,
        width: params.width,
        height: params.height,
        border: '2px solid #457B9D',
        borderRadius: 4,
        display: 'inline-block'
    },
});

const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

const canvasHeight = params.height - params.margin.top - params.margin.bottom;
const canvasWidth = params.width - params.margin.left - params.margin.right;
  
function MovingSeries(props) {
    const classes = useStyles();

    const { transitionSeries, transitionSeriesMax, timeDelta, restartTrigger } = props;

    const canvasRef = React.useRef(null);
    const mountedRef = React.useRef(false);

    useEffect(() => {

        if (mountedRef.current) {
            updateTimeSeries(transitionSeries);
        }

    }, [transitionSeries]);

    useEffect(() => {
        if (mountedRef.current && restartTrigger !== null) {
            const context = canvasRef.current.getContext('2d');
            context.clearRect(0, 0, params.width, params.height);
            context.restore();    
            drawChart();
        }
    }, [restartTrigger]);

    useEffect(() => {

        if (!mountedRef.current) {
            drawChart();
            mountedRef.current = true;
        }

    }, []);

    const updateTimeSeries = (transitionSeries) => {

        const context = canvasRef.current.getContext('2d');
        context.save();
        context.clearRect(0, 0, params.width, params.height);

        const minX = transitionSeries.length > 1 ? d3.min(transitionSeries, d => d.time) : 0;
        const xScale = d3.scaleLinear().domain([minX, minX + transitionSeriesMax*timeDelta]).range([0, canvasWidth]);

        const maxY = transitionSeries.length > 1 ? Math.ceil(params.yAxisMaxSf*d3.max(transitionSeries, d => d.val)) : 1;
        const yScale = d3.scaleLinear().domain([0, maxY]).range([canvasHeight, 0]).nice();

        // draw bars
        if (transitionSeries.length > 1) {
            transitionSeries.forEach(d => {
                const x = params.margin.left + xScale(d.time);
                const y = params.margin.top + yScale(d.val);
                const barHeight = params.margin.top + canvasHeight - y;
    
                context.beginPath();
                context.fillStyle = params.barColor;
                context.globalAlpha = params.barOpacity;
                context.fillRect(x, y, canvasWidth*params.barWidthSf/transitionSeriesMax, barHeight);
            });    
        }

        // draw x-axis
        context.beginPath();
        context.moveTo(params.margin.left, params.margin.top + yScale(0));
        context.lineTo(params.margin.left + canvasWidth, params.margin.top + yScale(0));
        context.strokeStyle = params.axisColor;
        context.lineWidth = params.axisWidth;
        context.stroke();

        // draw x-axis ticks
        const xTicks = xScale.ticks();
        xTicks.forEach((tick) => {
            const x = xScale(tick);
            context.beginPath();
            context.moveTo(x + params.margin.left, yScale(0) + params.margin.top - params.xTickLen);
            context.lineTo(x + params.margin.left, yScale(0) + params.margin.top + params.xTickLen);
            context.strokeStyle = params.axisColor;
            context.lineWidth = params.axisWidth;
            context.stroke();

            // add major gridlines
            if (tick > 0) {
                context.beginPath();
                context.moveTo(params.margin.left + x, params.margin.top);
                context.lineTo(params.margin.left + x, params.margin.top + canvasHeight);
                context.lineWidth = params.gridlineWidth;
                context.stroke();          
            }

            // add axis text
            context.font = params.axisFont;
            context.fillStyle = params.axisColor;
            context.textAlign = 'center';
            const formattedLabel = formatTime(tick);
            context.fillText(formattedLabel, x + params.margin.left + params.xAxisTextOffset.x, params.margin.top + yScale(0) + params.xAxisTextOffset.y);      
        });

        // draw y-axis
        context.beginPath();
        context.moveTo(xScale(minX) + params.margin.left, params.margin.top);
        context.lineTo(xScale(minX) + params.margin.left, params.margin.top + canvasHeight);
        context.strokeStyle = params.axisColor;
        context.lineWidth = params.axisWidth;
        context.stroke();

        // draw y-axis ticks
        const yTicks = yScale.ticks();
        yTicks.filter(d => parseInt(d) === d).forEach((tick) => {
            const y = yScale(tick);
            context.beginPath();
            context.moveTo(xScale(minX) + params.margin.left - params.yTickLen, y + params.margin.top);
            context.lineTo(xScale(minX) + params.margin.left + params.yTickLen, y + params.margin.top);
            context.strokeStyle = params.axisColor;
            context.lineWidth = params.axisWidth;
            context.stroke();

            // add major gridlines
            if (tick > 0) {
                context.beginPath();
                context.moveTo(params.margin.left, params.margin.top + y);
                context.lineTo(params.margin.left + canvasWidth, params.margin.top + y);
                context.lineWidth = params.gridlineWidth;
                context.stroke();          
            }            

            // add axis text
            context.font = params.axisFont;
            context.fillStyle = params.axisColor;
            context.textAlign = 'right';
            context.fillText(tick.toString(), params.margin.left + params.yAxisTextOffset.x, params.margin.top + y + params.yAxisTextOffset.y);
        });

        // add y-axis label
        context.translate(params.yAxisLabelOffset.x, params.margin.top + params.yAxisLabelOffset.y);
        context.rotate(-Math.PI/2);
        context.font = params.yAxisLabelFont;
        context.textAlign = 'right';
        context.fillStyle = params.yAxisLabelColor;
        context.globalAlpha = params.yAxisLabelOpacity;
        context.fillText('Frequency', 0, 0);

        context.restore();    

    };

    const drawChart = () => {

        const canvas = document.getElementById('time-series');
        canvas.width = params.width;
        canvas.height = params.height;
            
    };

    return (
        <canvas
            id='time-series'
            style={{ position: 'absolute', top: 0, left: 0 }}
            ref={canvasRef}
        />
    )
};

export default MovingSeries;