import React, { createRef } from "react";
import clsx from "clsx";
import { isEmpty } from "lodash";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { redirectToPage } from "../../utils/PageRedirectUtil";
import { logoutUser } from "../../utils/UserUtil";

import { withMediaQuery } from "../../theme/ThemeUtil";

import SearchField from "../TextField/SearchFieldLayout";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { withStyles, withTheme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";
import VideogameAssetRoundedIcon from "@material-ui/icons/VideogameAssetRounded";
import MenuBookRoundedIcon from "@material-ui/icons/MenuBookRounded";
import InfoRoundedIcon from "@material-ui/icons/InfoRounded";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

const styles = (theme) => ({
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: theme.palette.appBarBlue.main,
    height: "60px",
  },
  menuButton: {
    height: "fit-content",
    width: "fit-content",
    padding: 0,
    margin: 4,
  },
  secondaryMenuButton: {
    height: "fit-content",
    width: "fit-content",
    [theme.breakpoints.down("xs")]: {
      padding: "6px",
    },
    "& .MuiIconButton-colorPrimary": {
      color: "white",
    },
  },
  avatarIcon: {
    height: "35px",
    width: "35px",
    [theme.breakpoints.down("xs")]: {
      height: "25px",
      width: "25px",
    },
    color: "white",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "60px",
    minHeight: "60px",
    paddingRight: 0,
  },
  logo: {
    height: "50px",
    [theme.breakpoints.down("xs")]: {
      height: "30px",
    },
    "&:hover": {
      cursor: "pointer",
    },
  },
  leftNavbarGrid: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  rightNavbarGrid: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexGrow: 1,
  },
  menuPaper: {
    backgroundColor: theme.palette.menuBackground.main,
    color: "white",
    minWidth: "160px",
  },
  endMenuItem: {
    marginBottom: "5px",
  },
  searchIconButton: {
    color: "rgba(156, 140, 249, 1)",
  },
});

class PersistentAppBar extends React.Component {
  constructor(props) {
    super(props);
    this.accountAnchorRef = createRef(null);
    this.gameAnchorRef = createRef(null);
  }

  state = {
    openAccountMenu: false,
    openGameMenu: false,
  };

  prevOpenAccountMenu = false;
  prevOpenGameMenu = false;

  toggleAccountMenu = () => {
    this.setState({
      openAccountMenu: true,
    });
  };

  toggleGameMenu = () => {
    this.setState({
      openGameMenu: true,
    });
  };

  handleClose = (event) => {
    this.setState({
      openAccountMenu: false,
      openGameMenu: false,
    });
  };

  handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      this.setState({
        openAccountMenu: false,
        openGameMenu: false,
      });
    }
  };

  logout = () => {
    logoutUser()
      .then(() => {
        this.props.mutateUser();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  isScreenSmall = () => {
    const { mediaQuery } = this.props;
    const isScreenSmall = mediaQuery;
    return isScreenSmall;
  };

  reFocusWhenTransitionMenu = () => {
    if (this.prevOpenAccountMenu && !this.state.openAccountMenu) {
      this.accountAnchorRef.current.focus();
    }

    if (this.prevOpenGameMenu && !this.state.openGameMenu) {
      this.gameAnchorRef.current.focus();
    }

    this.prevOpenAccountMenu = this.state.openAccountMenu;
    this.prevOpenGameMenu = this.state.openGameMenu;
  };

  componentDidMount() {
    this.reFocusWhenTransitionMenu();
  }

  componentDidUpdate() {
    this.reFocusWhenTransitionMenu();
  }

  render() {
    const { classes, userSession } = this.props;

    const { openAccountMenu, openGameMenu } = this.state;

    return (
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Grid className={classes.leftNavbarGrid}>
            <img
              src="/bibliko.png"
              alt="Bibliko"
              className={classes.logo}
              onClick={() => {
                redirectToPage("/", this.props);
              }}
            />
          </Grid>
          <Grid className={classes.rightNavbarGrid}>
            {!this.isScreenSmall() && <SearchField />}
            {this.isScreenSmall() && (
              <IconButton className={classes.secondaryMenuButton}>
                <SearchRoundedIcon
                  className={clsx(classes.avatarIcon, classes.searchIconButton)}
                />
              </IconButton>
            )}
            <IconButton
              title="Game"
              className={classes.secondaryMenuButton}
              ref={this.gameAnchorRef}
              aria-controls={openGameMenu ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={this.toggleGameMenu}
            >
              <VideogameAssetRoundedIcon className={classes.avatarIcon} />
            </IconButton>
            <Popper
              open={openGameMenu}
              anchorEl={this.gameAnchorRef.current}
              role={undefined}
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper className={classes.menuPaper}>
                    <ClickAwayListener onClickAway={this.handleClose}>
                      <MenuList
                        autoFocusItem={openGameMenu}
                        id="menu-list-grow"
                        onKeyDown={this.handleListKeyDown}
                      >
                        <MenuItem dense disabled>
                          Transactions
                        </MenuItem>
                        <MenuItem dense>Buy Stocks</MenuItem>
                        <MenuItem dense>Trading History</MenuItem>
                        <MenuItem dense className={classes.endMenuItem}>
                          Pending Orders
                        </MenuItem>

                        <MenuItem dense disabled>
                          List
                        </MenuItem>
                        <MenuItem
                          dense
                          onClick={() => {
                            redirectToPage("/watchlist", this.props);
                          }}
                        >
                          Watchlist
                        </MenuItem>
                        <MenuItem dense className={classes.endMenuItem}>
                          Companies
                        </MenuItem>

                        <MenuItem dense disabled>
                          Explore
                        </MenuItem>
                        <MenuItem dense>Charts</MenuItem>
                        <MenuItem dense>Ranking</MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
            <IconButton
              title="Education"
              className={classes.secondaryMenuButton}
            >
              <MenuBookRoundedIcon className={classes.avatarIcon} />
            </IconButton>
            <IconButton
              title="About Us"
              className={classes.secondaryMenuButton}
            >
              <InfoRoundedIcon className={classes.avatarIcon} />
            </IconButton>
            <IconButton
              color="inherit"
              component="span"
              edge="end"
              className={classes.menuButton}
              ref={this.accountAnchorRef}
              aria-label="Account Menu"
              aria-controls={openAccountMenu ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={this.toggleAccountMenu}
              disableRipple
            >
              {isEmpty(userSession.avatarUrl) ? (
                <AccountCircleRoundedIcon className={classes.avatarIcon} />
              ) : (
                <Avatar
                  className={classes.avatarIcon}
                  src={userSession.avatarUrl}
                />
              )}
            </IconButton>
            <Popper
              open={openAccountMenu}
              anchorEl={this.accountAnchorRef.current}
              role={undefined}
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper className={classes.menuPaper}>
                    <ClickAwayListener onClickAway={this.handleClose}>
                      <MenuList
                        autoFocusItem={openAccountMenu}
                        id="menu-list-grow"
                        onKeyDown={this.handleListKeyDown}
                      >
                        <MenuItem>Account Settings</MenuItem>
                        <MenuItem
                          onClick={() => {
                            redirectToPage("/accountSummary", this.props);
                          }}
                        >
                          Portfolio
                        </MenuItem>
                        <MenuItem onClick={this.logout}>Log Out</MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: () => dispatch(userAction("logout")),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withStyles(styles)(
    withTheme(withRouter(withMediaQuery("(max-width:600px)")(PersistentAppBar)))
  )
);
