import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import { Theme, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Image from 'next/image';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { withStyles, makeStyles } from '@mui/styles';
import * as yup from 'yup';
import axios from 'axios';
import { authenticate } from '../components/utils';
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';
import { InputAdornment, IconButton } from '@mui/material';
import { Formik, Form, Field, FieldProps } from 'formik';
import { ComponentProps } from './_app';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { GoogleLogin, GoogleLoginResponse } from 'react-google-login';
import { NextPage } from 'next';
import { Status } from '../Utils/status';
import firebaseSDK from '../firebase';
import nookies from 'nookies';
const LoginButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText('#3997F5'),
    backgroundColor: '#3997F5',
    border: '2px solid white',
    borderRadius: '50px',
    padding: '10px 20px',
    '&:hover': {
      backgroundColor: '#1976D2',
    },
  },
}))(Button);

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: `url('/Vector2.png')`,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.mode === 'light' ? 'white' : theme.palette.grey[800],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    [theme.breakpoints.down('md')]: {
      backgroundColor: `#3997F5`,
    },
    [theme.breakpoints.down('xs')]: {
      backgroundColor:
        theme.palette.mode === 'light' ? 'white' : theme.palette.grey[800],
    },
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: '#3997F5',
  },
  form: {
    width: '100%', // Fix IE11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  logo: {
    // backgroundImage: `url('/chimerax.png')`,
    width: 'fit-content',
    height: '100px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(5),
  },
  imageTitle: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px `,
    border: '2px solid currentColor',
    borderRadius: '20px',
  },
  imageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  },
  imageTitle2: {
    color: theme.palette.common.white,
  },
  vector: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  imageV: {
    width: '100% !important',
    marginLeft: `${theme.spacing(8)} !important`,
    height: '600px',
  },
  customButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  base: {
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(6),
  },
  logoIcon: {
    border: '2px solid black',
    borderRadius: '50px',
  },
  loginBtn: {
    marginBottom: '10px',
    [theme.breakpoints.up('md')]: {
      marginBottom: '100px',
    },
  },
}));
const VectorImg = () => {
  const classes = useStyles();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  if (mobile) {
    return (
      <Box className={classes.vector}>
        <Image
          src='/signin.png'
          alt='logo'
          className={classes.imageV}
          width={window.innerWidth}
          height={window.innerWidth / 1.25}
        />
      </Box>
    );
  }
  return (
    <Box className={classes.vector}>
      <Image
        src='/signin.png'
        alt='logo'
        className={classes.imageV}
        width={460}
        height={367}
      />
    </Box>
  );
};
export interface FormValues {
  fullName: string;
  email: string;
  password: string;
}
const SignUp: NextPage<ComponentProps> = ({
  refetch,
  setErrorMessage,
  setSuccessMessage,
}) => {
  const classes = useStyles();
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>(Status.IDLE);
  const [visible, setVisible] = React.useState(false);
  const [formValues, setFormValues] = React.useState<FormValues>({
    fullName: '',
    email: '',
    password: '',
  });
  const initialValues = {
    fullName: '',
    email: '',
    password: '',
  };
  const validationSchema = yup.object({
    fullName: yup.string().required(),
    email: yup
      .string()
      .email('Provide a valid Email ID')
      .required('Email cannot be empty'),
    password: yup
      .string()
      .min(6, 'Password must be minimum of 6 characters')
      .required('Password cannot be empty'),
  });

  const handleShowPassword = () => {
    setVisible(!visible);
  };

  const handleSignUp = (values: typeof initialValues) => {
    setStatus(Status.LOADING);
    firebaseSDK
      .auth()
      .createUserWithEmailAndPassword(values.email, values.password)
      .then(async (response) => {
        // console.log(response.user);
        await response.user?.updateProfile({
          displayName: values.fullName,
        });
        return response;
      })
      .then(async (response) => {
        axios
          .post(`${process.env.NEXT_PUBLIC_BACKEND}/auth/register`, {
            name: response.user?.displayName,
            uid: response.user?.uid,
            email: response.user?.email,
            strategy: response.user?.providerData[0]?.providerId,
          })
          .then((response) => {
            // console.log(response.data);
            setStatus(Status.SUCCESS);
            setSuccessMessage(
              'Successfully created account. Please log in with your new account.'
            );
            return router.push('/dashboard/register');
          })
          .catch((error) => {
            setFormValues({ ...formValues });
            setStatus(Status.ERROR);
            setErrorMessage(error.response.data.errors);
            return error;
          });
        // await firebaseSDK.auth().signOut();
        return router.push('/login');
      })
      .catch((error) => {
        setFormValues({ ...formValues });
        setStatus(Status.ERROR);
        setErrorMessage(error.message);
        return error;
      });
  };

  const handleGoogleSignIn = () => {
    const provider = new firebaseSDK.auth.GoogleAuthProvider();
    firebaseSDK
      .auth()
      .signInWithPopup(provider)
      .then(async (response) => {
        axios
          .post(`${process.env.NEXT_PUBLIC_BACKEND}/auth/register`, {
            name: response.user?.displayName,
            uid: response.user?.uid,
            email: response.user?.email,
            strategy: response.user?.providerData[0]?.providerId,
          })
          .then((response) => {
            // console.log(response.data);
            setStatus(Status.SUCCESS);
            setSuccessMessage(
              'Successfully created account. Please log in with your new account.'
            );
            return router.push('/dashboard/register');
          })
          .catch((error) => {
            setFormValues({ ...formValues });
            setStatus(Status.ERROR);
            setErrorMessage(error.response.data.errors);
            return error;
          });
        // await firebaseSDK.auth().signOut();
        return router.push('/login');
      })
      .catch((error) => {
        setErrorMessage(`Couldn't sign up with Google\n ${error.message}`);
      });
  };

  return (
    <Grid container component='main' className={classes.root}>
      <Grid item xs={12} sm={6} component={Paper} elevation={0} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h2'>
            Sign Up
          </Typography>
          <Formik
            onSubmit={(values) => handleSignUp(values)}
            validationSchema={validationSchema}
            initialValues={initialValues}
          >
            <Form aria-label='sign up form' id='sign-up-form'>
              <Field name='fullName'>
                {({
                  field,
                  meta,
                }: FieldProps<typeof initialValues['fullName']>) => (
                  <TextField
                    fullWidth
                    id='name-input'
                    label='Full Name'
                    required
                    {...field}
                    error={!!(meta.touched && meta.error)}
                    helperText={meta.touched ? meta.error : ''}
                    variant='outlined'
                    // className={classes.field}
                    margin='normal'
                    // disabled
                  />
                )}
              </Field>
              <Field name='email'>
                {({
                  field,
                  meta,
                }: FieldProps<typeof initialValues['email']>) => (
                  <TextField
                    fullWidth
                    id='email-input'
                    label='Email Address'
                    required
                    {...field}
                    error={!!(meta.touched && meta.error)}
                    helperText={meta.touched ? meta.error : ''}
                    variant='outlined'
                    // className={classes.field}
                    margin='normal'
                    // disabled
                  />
                )}
              </Field>
              <Field name='password'>
                {({
                  field,
                  meta,
                }: FieldProps<typeof initialValues['password']>) => (
                  <TextField
                    fullWidth
                    id='password-input'
                    label='Password'
                    required
                    // disabled
                    {...field}
                    error={!!(meta.touched && meta.error)}
                    helperText={meta.touched ? meta.error : ''}
                    variant='outlined'
                    // className={classes.field}
                    margin='normal'
                    type={visible ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleShowPassword}
                            edge='end'
                          >
                            {visible ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Field>
              <FormControlLabel
                control={<Checkbox value='remember' color='primary' />}
                label='Remember me'
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                className={classes.submit}
                color='primary'
                // disabled
              >
                {status === Status.LOADING
                  ? `Submitting...`
                  : `Create new account`}
              </Button>
              <Box mt={5}>
                {' '}
                <Typography align='center' variant='subtitle1'>
                  Or Sign up with other social platforms
                </Typography>
              </Box>
              <Box>
                <Grid container justifyContent='center' alignItems='center'>
                  <IconButton
                    onClick={handleGoogleSignIn}
                    // disabled={}
                  >
                    <Image
                      src='/google-logo.png'
                      alt='google'
                      width={60}
                      height={60}
                      className={classes.logoIcon}
                    />
                  </IconButton>
                </Grid>
              </Box>
            </Form>
          </Formik>
        </div>
      </Grid>

      <Grid item xs={false} sm={6} className={classes.image}>
        <Box className={classes.logo}>
          <Typography
            component='span'
            variant='h3'
            color='inherit'
            className={classes.imageTitle2}
          >
            One of us?
          </Typography>
        </Box>
        <Box className={classes.loginBtn}>
          <Grid container justifyContent='center' alignItems='center'>
            <LoginButton onClick={() => router.push('/login')}>
              Log In
            </LoginButton>
          </Grid>
        </Box>
        <VectorImg />
      </Grid>
    </Grid>
  );
};

export default SignUp;
