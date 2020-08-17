import React from "react";
import { isEqual } from "lodash";
import { withRouter } from "react-router";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
//import DatePicker from "react-datepicker";
const styles = (theme) => ({
  setDate: {
    //backgroundColor: "white",
    height: 50,
    margin: "10px",
    fontWeight: "normal",
    "& label.Mui-focused": {
      color: "black",
    },
    "& .MuiFilledInput-underline:after": {
      borderBottom: "2px solid #000000",
    },
    "& .MuiFilledInput-root": {
      "&.Mui-focused": {
        backgroundColor: "rgba(225,225,225,0.5)",
      },
    },
  },
  input: {
    color: "black",
    backgroundColor: "rgba(225,225,225,0.65)",
    "&:hover": {
      backgroundColor: "rgba(225,225,225,0.5)",
    },
    "& input": {
      backgroundColor: "rgba(225,225,225,0)",
    },
  },
});

class DatePickerHistory extends React.Component {
  state = {
    startDate: new Date(),
  };

  handleChange = (date) => {
    this.setState({
      startDate: date,
    });
  };
  render() {
    const { classes } = this.props;

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          className={classes.setDate}
          variant="inline"
          inputVariant="filled"
          format="dd/MM/yyyy"
          margin="normal"
          id={this.props.name}
          name={this.props.name}
          label={this.props.name}
          InputProps={{
            className: classes.input,
          }}
          value={this.state.startDate}
          onChange={this.handleChange}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
        />
      </MuiPickersUtilsProvider>
    );
  }
}

export default withStyles(styles)(withRouter(DatePickerHistory));