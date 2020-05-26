import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
    userAction,
} from '../../redux/storeActions/actions';

import FunctionsProvider from '../../provider/FunctionsProvider';

import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        position: 'absolute',
        height: '-webkit-fill-available',
        width: '-webkit-fill-available',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    paper: {
        position: 'absolute',
        height: 500,
        width: 450,
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
        flexBasis: 'unset'
    },
    title: {
        fontSize: 'x-large',
        fontWeight: 'bold'
    },
    submit: {
        marginTop: '16px',
        padding: theme.spacing(1),
        minHeight: '40px',
        background: theme.palette.barButton.main,
        '&:hover': {
            opacity: 0.85
        },
        fontWeight: 'bold'
    },
    link: {
        fontWeight: 'bold',
        fontSize: 'small'
    },
    image: {
        borderRadius: '50%',
        height: "50px",
        width: "50px" 
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
        color: theme.palette.subText.main,
        fontSize: 'small',
        marginTop: theme.spacing(1)
    },
    error: {
        marginTop: 5,
        display: 'flex',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 'small'
    },
});

class Login extends React.Component {
    state = {
        error: "",
    }

    errorTypes = [
        "Missing some fields"
    ]

    email=""
    password=""

    changeEmail = (event) => {
        this.email = event.target.value;
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
            _.isEmpty(this.email) ||
            _.isEmpty(this.password)
        ) {
            this.setState({ error: this.errorTypes[0] });
        }
        else {
            if(_.isEmpty(this.state.error)) {
                this.context.loginUser('local', {
                    email: this.email,
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
                    className={classes.paper}
                    variant="outlined"
                    elevation={2}
                >
                    <Grid container spacing={2} direction="column"
                        className={classes.center}
                    >
                        <Grid item xs className={classes.center}>
                            <Typography className={classes.title}>
                                Log In
                            </Typography>
                        </Grid>
                        <Grid 
                            container spacing={1} direction="column"
                            item xs className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <TextField 
                                    id="Email"
                                    label="Email"
                                    onChange={this.changeEmail}
                                    onKeyDown={this.handleKeyDown}
                                />
                            </Grid>
                            <Grid item xs className={classes.center}>
                                <TextField 
                                    id="Password"
                                    label="Password"
                                    type="password"
                                    onChange={this.changePassword}
                                    onKeyDown={this.handleKeyDown}
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
                            <Grid item xs className={classes.center}>
                                <Button className={classes.submit}
                                    onClick={this.submit}
                                >
                                    Submit
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
                                <Button 
                                    onClick={() => {loginUser("google")}}
                                    classes={{
                                        root: classes.alternativeLoginButton
                                    }}
                                >
                                    <img 
                                        src="/google.jpg"
                                        alt="google"
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