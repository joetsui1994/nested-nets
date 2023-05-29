import * as React from 'react';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

const ColouredSlider = styled(Slider)({
    color: '#1D3557',
    width: '96%',
    '& .MuiSlider-valueLabel': {
        fontSize: 11,
        fontWeight: 'normal',
        top: 35,
        color: '#A8DADC',
        backgroundColor: 'unset',
        '&:before': {
          display: 'none',
        },
        '& *': {
          background: 'transparent',
        },
    },
    '& .MuiSlider-thumb': {
        backgroundColor: '#A8DADC',
        opacity: 0.8,
        '&:focus, &:hover, &.Mui-active': {
          boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
        },
      },
    
});
  
function CustomSlider(props) {

  const { value, defaultValue, step, min, max, onChangeHandler } = props;

  return (
    <ColouredSlider
        size="small"
        valueLabelDisplay="on"
        value={value}
        defaultValue={defaultValue}
        step={step}
        min={min}
        max={max}
        onChange={onChangeHandler}
    />
  );
}

export default CustomSlider;