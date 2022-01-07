import React, { Dispatch, SetStateAction } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useRouter } from 'next/dist/client/router';
import cookie from 'js-cookie';
import firebaseSDK from '../../firebase';
import nookies from 'nookies';
import Link from 'next/link';
import { logout } from '../../Auth/logout';

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
}));

interface NavbarProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  setSuccessMessage: (message: string) => void;
  setErrorMessage: (message: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  setOpen,
  setSuccessMessage,
  setErrorMessage,
}) => {
  const classes = useStyles();
  const router = useRouter();
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  return (
    <AppBar position='sticky'>
      <Toolbar>
        <IconButton
          edge='start'
          color='inherit'
          aria-label='menu'
          onClick={handleDrawerOpen}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant='h6' className={classes.title}>
          Chimera-X
        </Typography>
        <Link href='/login'>
          <Button
            color='inherit'
            onClick={async () => {
              await logout();
              router.reload();
            }}
          >
            Log out
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
};
export default Navbar;
