import React from "react";

import clsx from "clsx";

import SelectBox from "../SelectBox/SelectBox";

import { withStyles } from "@material-ui/core/styles";

import Grid from '@material-ui/core/Grid';

const styles = (theme) => ({
  gridContainer: {
    marginBottom: "30px",
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "15px",
      marginTop: "10px",
    },
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    minWidth: "150px",
  },
});

class SelectSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {
        region: this.props.region || "",
        occupation: this.props.occupation || "",
      },
    };
    this.recordRegion = this.recordRegion.bind(this);
    this.recordOccupation = this.recordOccupation.bind(this);
  }

  reset() {
    this.setState({
      input: {
        region: this.props.region,
        occupation: this.props.occupation,
      },
    });
  }

  createChangeLog(region, occupation) {
    return { region, occupation };
  }

  recordRegion(e) {
    const input = { ...this.state.input, region: e.target.value };
    this.setState({
      input: input,
    });
    this.props.recordChanges(
      this.createChangeLog(e.target.value, this.state.input.occupation)
    );
  }

  recordOccupation(e) {
    const input = { ...this.state.input, occupation: e.target.value };
    this.setState({
      input: input,
    });
    this.props.recordChanges(
      this.createChangeLog(this.state.input.region, e.target.value)
    );
  }

  render() {
    const { classes } = this.props;
    const { input } = this.state;
    const occupations = ["Student", "Teacher", "Other"];
    const regions = [
      "Africa",
      "Asia",
      "The Caribbean",
      "Central America",
      "Europe",
      "North America",
      "Oceania",
      "South America",
    ];

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={2}
          direction="row"
          className={clsx(classes.fullHeightWidth, classes.gridContainer)}
        >
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SelectBox
              name="Region"
              value={input.region}
              items={regions}
              onChange={this.recordRegion}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SelectBox
              name="Occupation"
              value={input.occupation}
              items={occupations}
              onChange={this.recordOccupation}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(SelectSection);