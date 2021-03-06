import React from "react";
import { withRouter } from "react-router";
import clsx from "clsx";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";
import { getStockScreener } from "../../utils/FinancialModelingPrepUtil";

import {
  SortDirection,
} from "react-virtualized";

import { withStyles } from "@material-ui/core/styles";
import {
  Container,
  Grid,
  Typography,
} from "@material-ui/core";

import CompanyDialog from "../../components/CompanyDetail/CompanyDialog";
import CompaniesListTable from "../../components/Table/CompaniesListTable/CompaniesListTable"
import Filter from "../../components/StockScreener/Filter";
import ProgressButton from "../../components/Button/ProgressButton";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    marginBottom: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.customMargin.topLayoutSmall,
      marginBottom: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "none",
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
    padding: "24px",
    [theme.breakpoints.down("xs")]: {
      padding: "0px",
    },
  },
  itemGrid: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
  },
  gridTitle: {
    fontSize: "x-large",
    fontWeight: "bold",
    color: "white",
    marginBottom: "10px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
      marginTop: "20px",
    },
  },
  reloadButton: {
    marginTop: "10px",
    marginBottom: "20px",
  },
});

function descendingComparator(a, b, orderBy) {
  let items = [a[orderBy], b[orderBy]];

  if (typeof(items[0]) === "string") {
    items = items.map((value) => value.toLowerCase());
  }

  if (items[1] < items[0]) {
    return -1;
  }
  if (items[1] > items[0]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === SortDirection.DESC
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

class Companies extends React.Component {
  state = {
    openDialog: false,
    stockData: [],
    sortBy: "code",
    sortDirection: SortDirection.ASC,
    price: [0,320000],
    marketCap: [0,1189.207115], // [$0, $2T]
    sector: "All",
    industry: "All",
    success: false,
    fail: false,
    loading: false,
    debounce: false,
  };

  handleSort = (sortDirection, sortBy) => {
    let { stockData } = this.state;
    this.setState({
      stockData: stableSort(stockData, getComparator(sortDirection, sortBy)),
      sortBy: sortBy,
      sortDirection: sortDirection
    });
  };

  handleOpenDialog = ({ rowData }) => {
    this.setState({
      openDialog: true,
      companyName: rowData.name,
    });
  };

  handleCloseDialog = () => {
    this.setState({
      openDialog: false,
    });
  };

  // MarketCap scale: y=x^4
  getMarketCap = (value) => {
    return value**4;
  };

  handleFilterChange = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  setSuccess = () => {
    this.setState({
      loading: false,
      success: true,
      fail: false,
    });
  };

  setError = () => {
    this.setState({
      loading: false,
      success: false,
      fail: true,
    });
  };

  handleReload = () => {
    if (this.state.debounce) return;

    this.setState({
      loading: true,
      debounce: true,
    });
    this.updateStockScreener(this.setSuccess, this.setError);
    setTimeout(() => {this.setState({debounce:false})}, 5000);
  };

  updateStockScreener = (callback = ()=>{}, errorCallback = ()=>{}) => {
    const {
      price,
      marketCap,
      sector,
      industry,
    } = this.state;

    getStockScreener({
      priceFilter: price,
      marketCapFilter: marketCap.map((value) => this.getMarketCap(value)),
      sectorFilter: sector,
      industryFilter: industry,
    })
    .then((stockData) => {
      const { sortDirection, sortBy } = this.state;

      this.setState({
        stockData: stableSort(stockData, getComparator(sortDirection, sortBy)),
      });
      callback();
    })
    .catch(() => {
      errorCallback();
    });
  };

  componentDidMount() {
    this.updateStockScreener();
  }

  render() {
    const { classes } = this.props;
    const {
      openDialog,
      companyName,
      sortBy,
      sortDirection,
      stockData,
      price,
      marketCap,
      sector,
      industry,
      success,
      fail,
      loading,
    } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={4}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Grid item xs={12} sm={4} className={classes.itemGrid}>
            <ProgressButton
              containerClass={classes.reloadButton}
              size={"medium"}
              success={success}
              fail={fail}
              loading={loading}
              handleClick={this.handleReload}
            >
              Reload
            </ProgressButton>
            <Filter
              price={price}
              marketCap={marketCap}
              sector={sector}
              industry={industry}
              getMarketCap={this.getMarketCap}
              handleChange={this.handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography className={clsx(classes.gridTitle)} component="div">
              Companies List
            </Typography>

            <CompaniesListTable
              height={600}
              rows={stockData}
              sortBy={sortBy}
              sortDirection={sortDirection}
              handleSort={this.handleSort}
              handleOpenCompanyDetail={this.handleOpenDialog}
            />
          </Grid>
        </Grid>

        <CompanyDialog
          open={openDialog}
          handleClose={this.handleCloseDialog}
          companyName={companyName}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(Companies)));
