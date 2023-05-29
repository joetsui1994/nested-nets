import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const CustomButton = styled(Button)({
    boxShadow: 'none',
    textDecoration: 'underline',
    fontSize: 10,
    fontWeight: 900,
    textAlign: 'right',
    display: 'inline-block',
    paddingRight: 10,
    marginTop: 7,
    width: '100%',
    color: '#A8DADC',
    '&:hover': {
        textDecoration: 'underline',
        boxShadow: 'none',
        opacity: 0.8,
    }
});
  

function ResetButton(props) {

    const { handleResetDefaultsOnClick } = props;

    return (
        <CustomButton
            variant="text"
            onClick={handleResetDefaultsOnClick}
            disableRipple={true}
        >
            RESET TO DEFAULT
        </CustomButton>
    );
}

export default ResetButton;