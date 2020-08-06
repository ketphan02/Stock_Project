import React, { createRef } from "react";
import clsx from "clsx";
import { isEmpty } from "lodash";

import { ComponentWithForwardedRef } from "../../utils/ComponentUtil";
import { oneSecond } from "../../utils/DayTimeUtil";
import { searchCompanyTickers } from "../../utils/FinancialModelingPrepUtil";

import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Paper from "@material-ui/core/Paper";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import { CircularProgress } from "@material-ui/core";

import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

const styles = (theme) => ({
  textField: {
    width: "100%",
    margin: "8px",
    fontWeight: "normal",
    color: "white",
    "& .MuiInputBase-root": {
      height: "40px",
      borderRadius: "20px",
    },
    "& .MuiInputLabel-outlined": {
      transform: "translate(14px, 11px) scale(1)",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
    },
    "& .MuiOutlinedInput-underline:after": {
      borderBottom: "2px solid #000000",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(156, 140, 249, 0.8)",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(156, 140, 249, 1)",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(156, 140, 249, 1)",
    },
    "& .MuiFormLabel-root": {
      fontSize: "medium",
      color: "rgba(156, 140, 249, 0.7)",
      "&.Mui-focused": {
        color: "rgba(156, 140, 249, 1)",
      },
    },
  },
  input: {
    color: "white",
    fontSize: "medium",
  },
  iconButton: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  hide: {
    display: "none",
  },
  searchFieldContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 0,
    width: "30%",
    [theme.breakpoints.down("md")]: {
      width: "40%",
    },
    transition: "width 0.75s",
  },
  extendWidthSearchField: {
    width: "40%",
    [theme.breakpoints.down("md")]: {
      width: "50%",
    },
  },
  menuPaper: {
    backgroundColor: theme.palette.menuBackground.main,
    color: "white",
  },
  popperSearch: {
    minWidth: "40%",
    maxWidth: "100%",
    maxHeight: "50%",
    zIndex: theme.zIndex.searchMenu,
  },
  searchIcon: {
    color: "rgba(156, 140, 249, 0.7)",
  },
});

const NYSE = [
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
];

const NASDAQ = [
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
];

class SearchFieldLayout extends React.Component {
  state = {
    openSearchMenu: false,
    searchCompany: "",
    companiesNYSE: [],
    companiesNASDAQ: [],

    isExtendingSearchMenu: false,
  };

  searchAnchorRef = createRef(null);
  prevOpenSearchMenu = false;

  timeoutForSearch; // half a second timeout -> delay searching

  setTimeoutForSearch = () => {
    this.timeoutForSearch = setTimeout(
      () => this.searchCompany(),
      oneSecond / 2
    );
  };

  searchCompany = () => {
    if (isEmpty(this.state.searchCompany) && this.state.openSearchMenu) {
      this.turnOffSearchMenu();
    }

    if (!isEmpty(this.state.searchCompany) && !this.state.openSearchMenu) {
      this.turnOnSearchMenu();
      //   searchCompanyTickers(this.state.searchCompany)
      //     .then((resultTickers) => {
      //       this.setState({
      //         companiesNYSE: resultTickers[0],
      //         companiesNASDAQ: resultTickers[1],
      //       });
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //     });
      this.setState({
        companiesNYSE: NYSE,
        companiesNASDAQ: NASDAQ,
      });
    }
  };

  changeSearchCompany = (event) => {
    if (this.timeoutForSearch) {
      clearTimeout(this.timeoutForSearch);
    }

    this.setState({
      searchCompany: event.target.value,
    });

    this.turnOffSearchMenu();

    this.setTimeoutForSearch();
  };

  clearSearchCompany = () => {
    this.setState(
      {
        searchCompany: "",
      },
      () => {
        this.shrinkSearchMenu();
      }
    );
  };

  handleClose = (event) => {
    this.turnOffSearchMenu();
  };

  handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      this.turnOffSearchMenu();
    }
  };

  turnOnSearchMenu = () => {
    this.setState({
      openSearchMenu: true,
    });
  };

  turnOffSearchMenu = () => {
    this.setState({
      openSearchMenu: false,
    });
  };

  extendSearchMenu = (event) => {
    if (!this.state.isExtendingSearchMenu) {
      this.setState({
        isExtendingSearchMenu: true,
      });
    }
  };

  shrinkSearchMenu = (event) => {
    if (isEmpty(this.state.searchCompany)) {
      this.setState({
        isExtendingSearchMenu: false,
      });
    }
  };

  showResultTickers = (company) => {
    const { symbol, name, currency, exchangeShortName } = company;
    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {symbol}
        </Grid>
        <Grid item xs={6}>
          {name}
        </Grid>
        <Grid item xs={6}>
          {currency}
        </Grid>
        <Grid item xs={6}>
          {exchangeShortName}
        </Grid>
      </Grid>
    );
  };

  render() {
    const { classes } = this.props;
    const {
      openSearchMenu,
      companiesNYSE,
      companiesNASDAQ,
      isExtendingSearchMenu,
    } = this.state;

    return (
      <div
        className={clsx(classes.searchFieldContainer, {
          [classes.extendWidthSearchField]: isExtendingSearchMenu,
        })}
      >
        <TextField
          id="Search"
          ref={this.searchAnchorRef}
          value={this.state.searchCompany}
          label="Search"
          autoComplete="off"
          variant="outlined"
          margin="normal"
          className={classes.textField}
          onChange={this.changeSearchCompany}
          onClick={this.extendSearchMenu}
          onBlur={this.shrinkSearchMenu}
          InputProps={{
            className: classes.input,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  className={clsx(classes.iconButton, {
                    [classes.hide]: isEmpty(this.state.searchCompany),
                  })}
                  onClick={this.clearSearchCompany}
                >
                  <ClearRoundedIcon />
                </IconButton>
                <SearchRoundedIcon
                  className={clsx(classes.searchIcon, {
                    [classes.hide]: !isEmpty(this.state.searchCompany),
                  })}
                />
              </InputAdornment>
            ),
          }}
        />
        <Popper
          open={openSearchMenu}
          anchorEl={this.searchAnchorRef.current}
          placement="bottom-start"
          className={classes.popperSearch}
          transition
          modifiers={{
            flip: {
              enabled: false,
            },
          }}
        >
          {({ TransitionProps, placement }) => (
            <Grow {...TransitionProps}>
              <Paper className={classes.menuPaper}>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList
                    id="menu-list-grow"
                    onKeyDown={this.handleListKeyDown}
                  >
                    {isEmpty(companiesNASDAQ) && isEmpty(companiesNYSE) && (
                      <CircularProgress />
                    )}
                    {companiesNYSE.map((company, index) => (
                      <MenuItem key={index}>
                        {this.showResultTickers(company)}
                      </MenuItem>
                    ))}
                    {companiesNASDAQ.map((company, index) => (
                      <MenuItem key={index}>
                        {this.showResultTickers(company)}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    );
  }
}

export default ComponentWithForwardedRef(withStyles(styles)(SearchFieldLayout));
