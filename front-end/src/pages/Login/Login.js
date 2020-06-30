import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
    userAction,
} from '../../redux/storeActions/actions';
import { socket } from '../../App';
import FunctionsProvider from '../../provider/FunctionsProvider';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
//import { black } from '@material-ui/core/colors';

const styles = theme => ({

    root: { 
        background: 'black',
        position: 'absolute',
        height: '-webkit-fill-available',
        width: '-webkit-fill-available',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    paper: {
        background: theme.palette.gradientPaper.main,
        position: 'absolute',
        height: 'fit-content',
        width: 450,
        [theme.breakpoints.down('xs')]: {
            height: '100%',
            width: '100%',
        },
        padding: theme.spacing(1),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        flexBasis: 'unset',
        
    },
    title: {
        
        top: '245px',
        fontSize: 'x-large',
        fontWeight: 'bold'
    },
    submit: {
        marginTop: '4px',
        padding: theme.spacing(1),
        height: '40px',
        width: '120px',
        background: 'black',
        '&:hover': {
            opacity: 0.85
        },
        borderRadius: 30,
        color: 'white',
        fontWeight: 'bold'
    },
    link: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 'small'
    },
    image: {
        borderRadius: '50%',
        height: "45px",
        width: "45px" 
    },
    avatar: {

        height: "120px",
        width: "120px", 
        margin: theme.spacing(1)
    },
    rememberMe:{
        color: 'black',
        fontSize: 'small',
        

    },
    alternativeLoginButton: {
        maxHeight: 'fit-content',
        maxWidth: 'fit-content',
        padding: 0,
        minWidth: 0,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: '50%'
    },
    orLogInWith: {
        marginTop: 0,
        fontWeight: '500',
        color: theme.palette.subText.main,
        fontSize: 15
        
    },
    error: {
        marginTop: 5,
        display: 'flex',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 'small'
    },
    input: {
        color:'black',
        backgroundColor: 'rgba(225,225,225,0.65)',
        
    },
    textField: {
        width: '100%',
        height: 50,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingBottom: 0,
        marginTop: 0,
        fontWeight: 500,
        "& label.Mui-focused": {
            color: "black"
          },
        "& .MuiInput-underline:after": {
            borderBottomColor: 'black'
          },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'black',
            },
            '&:hover fieldset': {
              borderColor: 'black',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'black',
            },
          },
    }
});

class Login extends React.Component {
    state = {
        error: "",
    }

    errorTypes = [
        "Incorrect username or password."
    ]

    username=""
    password=""

    changeUsername = (event) => {
        this.username = event.target.value;
        if(!_.isEmpty(this.state.error)) {
            this.setState({ error: "" });
        }
    }

    changePassword = (event) => {
        this.password = event.target.value;
        if(!_.isEmpty(this.state.error)) {
            this.setState({ error: "" });
        }
    }

    handleKeyDown = (event) => {
        if(event.key==="Enter") {
            this.submit();
        }
    }

    redirect = (link) => {
        const { history } = this.props;
        history.push(link);
    }

    submit = () => {
        if(
            _.isEmpty(this.username) ||
            _.isEmpty(this.password)
        ) {
            this.setState({ error: this.errorTypes[0] });
        }
        else {
            if(_.isEmpty(this.state.error)) {
                this.context.loginUser('local', {
                    username: this.username,
                    password: this.password
                })
                .then(() => {
                    return this.context.getUser();
                })
                .then(user => {
                    this.props.mutateUser(user.data);
                })
                .catch(err => {
                    this.setState({ error: err });
                })
            }
        }
    }
    
    componentCheck = () => {
        if(!_.isEmpty(this.props.userSession)) {
            this.redirect('/');
        }
    }

    componentDidMount() {
        this.componentCheck();
        
        // testing socket
        socket.on("FromAPI", (data) => {
            console.log(data);
        })
    }
    
    componentDidUpdate() {
        this.componentCheck();
    }

    render() {
        const { classes } = this.props;
        const { loginUser } = this.context;

        return (
            <div className={classes.root}>
                <Paper 
                    //backgroundColor='transparent'
                    className={classes.paper}
                    elevation={2}
                >
                    <Grid container spacing={2} direction="column"
                        className={classes.center}
                    >
                        <Grid item xs className={classes.center}>
                            <Typography className={classes.title}>
                                <img 
                                    src="/bib.png"
                                    alt="Bibliko"
                                    className={classes.avatar}
                                />
                            </Typography>
                        </Grid>
                        <Grid 
                            container spacing={1} direction="column"
                            item xs className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <TextField 

                                    variant="filled"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="Username"
                                    label="Username"
                                    name="Username"
                                    autoComplete="Username"
                                    onChange={this.changeUsername}
                                    onKeyDown={this.handleKeyDown}
                                    InputProps={{
                                        className: classes.input,
                                     }}
                                    className={classes.textField}
                                    
                                    
                                />
                            </Grid>
                            <Grid item xs className={classes.center}>
                                <TextField 
                                    
                                    variant= "filled"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    onChange={this.changePassword}
                                    onKeyDown={this.handleKeyDown}
                                    className={classes.textField}
                                    InputProps={{
                                        className: classes.input,
                                    }}
                                />
                            </Grid>
                            {
                                !_.isEmpty(this.state.error) &&
                                <Grid item xs className={classes.error}>
                                    <Typography color="error" align="center"
                                        className={classes.errorText}
                                    >
                                        Error: {this.state.error}
                                    </Typography>
                                </Grid>
                            }
                            
                            <FormControlLabel
                                className={classes.rememberMe}
                                control={<Checkbox value="remember" />}
                                label="Remember me"// a checkbox for Remember me.
                            />
                            <Grid item xs className={classes.center}>
                                <Button className={classes.submit}
                                    onClick={this.submit}
                                >
                                    Log in
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid item xs className={classes.center}>
                            <Button 
                                color="primary"
                                onClick={() => {this.redirect("/signup")}}
                                className={classes.link}
                            >
                                Create an account
                            </Button>
                            <Divider orientation="vertical" flexItem/>
                            <Button 
                                color="primary"
                                onClick={() => {this.redirect("/forgotpassword")}}
                                className={classes.link}
                            >
                                Forgot password
                            </Button>
                        </Grid>
                        <Grid 
                            container spacing={1} direction="column"
                            item xs className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <Typography className={classes.orLogInWith}>
                                    Or Log In with:
                                </Typography>
                            </Grid>
                            <Grid item xs
                                className={classes.center}
                            >
                                <Button 
                                    onClick={() => {loginUser("google")}}
                                    classes={{
                                        root: classes.alternativeLoginButton
                                    }}
                                >
                                    <img 
                                        src="/google-logo-png-open-2000.png"
                                        alt='google'
                                        className={classes.image}
                                    />
                                </Button>
                            
                                <Button 
                                    onClick={() => {loginUser("facebook")}}
                                    classes={{
                                        root: classes.alternativeLoginButton
                                    }}
                                >
                                    <img 
                                        src="/facebook.png"
                                        alt="facebook"
                                        className={classes.image}
                                    />
                                </Button>
                                
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

Login.contextType = FunctionsProvider.context;

const mapStateToProps = (state) => ({
    userSession: state.userSession,
});
  
const mapDispatchToProps = (dispatch) => ({
    mutateUser: (userProps) => dispatch(userAction(
        'default',
        userProps
    )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(withRouter(Login))
);