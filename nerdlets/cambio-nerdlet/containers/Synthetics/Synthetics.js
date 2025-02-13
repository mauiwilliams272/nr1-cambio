import React from 'react';
import PropTypes from 'prop-types';
import { Spinner, Tooltip } from 'nr1';
import SearchInput from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ModalSynthetics from './ModalSynthetics';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import jsoncsv from 'json-2-csv';
import JSZip from 'jszip';
import ArrowUnion from '../../components/ArrowsTable/ArrowUnion';
import { saveAs } from 'file-saver';

const greenColor = '#007E8A';
const KEYS_TO_FILTERS = ['name', 'type', 'location', 'status', 'message'];

export default class Synthetics extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      savingAllChecks: false,
      pagePag: 0,
      pages: 0,
      totalRows: 10,
      searchTermTest: '',
      sortColumn: {
        column: '',
        order: ''
      },
      hidden: false,
      infoAditional: {},
      data: [],
      dataRespaldo: [],
      modal: true
    };
  }

  componentDidMount() {
    const { testList = [] } = this.props;
    console.log(testList);
    console.log("Looping in testList");
    const data = [];
    testList.forEach(element => {
      let loca = '';
      if (element.locations) {
        if (element.locations.length === 0) {
          loca = '-----';
        } else {
          const limitData = element.locations.splice(0, 3);
          for (const location of limitData) {
            loca = `${loca} ${location} \n`;
          }
          if (element.locations.length > 3) loca = `${loca} ...`;
        }
      }
      const assertions = [];
      if (element.config.assertions) {
        element.config.assertions.forEach(elementassertion => {
          assertions.push({ value: elementassertion.target });
        });
      }
      const variables = [];
      if (element.config.variables) {
        element.config.variables.forEach(elementvariables => {
          let tags = '';
          if (elementvariables.tags) {
            if (tags === '') {
              elementvariables.tags.forEach(tag => {
                tags = `${tag}`;
              });
            } else {
              elementvariables.tags.forEach(tag => {
                tags = `${tags} ${tag} \n`;
              });
            }
          }
          if (tags === '') {
            tags = '-----';
          }
          let value1 = {};
          if (elementvariables.value) {
            value1 = elementvariables.value;
          }
          variables.push({
            name: elementvariables.name ? elementvariables.name : '-----',
            id: elementvariables.id ? elementvariables.id : '-----',
            description: elementvariables.description
              ? elementvariables.description
              : '-----',
            tags: tags,
            value: value1.value ? value1.value : '-----',
            secure: value1.secure ? value1.secure : '-----'
          });
        });
      }
      const steps = [];
      if (element.steps) {
        element.steps.forEach(elementsteps => {
          console.log(elementsteps.name);
          let params = '';
          if (elementsteps.request) {
            params = `${
              elementsteps.request.method ? elementsteps.request.method : ''
            } ${elementsteps.request.url ? elementsteps.request.url : ''}`;
          }
          params = elementsteps.params;

          steps.push({
            params: params !== '' ? params : '-----',
            type: elementsteps.type ? elementsteps.type : '-----'
          });
        });
      }
      data.push({
        name: element.name,
        type: element.type,
        status: element.status,
        location: loca,
        assertions: assertions,
        message: element.message !== '' ? element.message : '-----',
        // eslint-disable-next-line no-nested-ternary
        host: element.config.request
          ? element.config.request.host
            ? element.config.request.host
            : '-----'
          : '-----',
        // eslint-disable-next-line no-nested-ternary
        url: element.config.request
          ? element.config.request.url
            ? element.config.request.url
            : '-----'
          : '-----',
        // eslint-disable-next-line no-nested-ternary
        method: element.config.request
          ? element.config.request.method
            ? element.config.request.method
            : '-----'
          : '-----',
        // eslint-disable-next-line no-nested-ternary
        query: element.config.request
          ? element.config.request.query
            ? element.config.request.query
            : '-----'
          : '-----',
        variables: variables,
        steps: steps
      });
    });
    if (
      data.host === '-----' &&
      data.url === '-----' &&
      data.method === '-----' &&
      data.query === '-----' &&
      data.variables.length === 0 &&
      data.assertions.length === 0 &&
      data.steps.length === 0
    ) {
      this.setState({ modal: false });
    }
    this.setState({ data, dataRespaldo: data });
    this.calcTable(data);
  }

  upPage = () => {
    const { pagePag } = this.state;
    this.setState({ pagePag: pagePag + 1 });
  };

  changePage = pagePag => {
    this.setState({ pagePag: pagePag - 1 });
  };

  downPage = () => {
    const { pagePag } = this.state;
    this.setState({ pagePag: pagePag - 1 });
  };

  searchUpdated = term => {
    const { dataRespaldo, sortColumn } = this.state;
    this.loadData(dataRespaldo, term, sortColumn);
    this.setState({ searchTermTest: term });
  };

  _onClose = () => {
    const actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  saveAction = async (action, infoAditional) => {
    if (
      infoAditional.host !== '-----' ||
      infoAditional.url !== '-----' ||
      infoAditional.method !== '-----' ||
      infoAditional.query !== '-----' ||
      infoAditional.variables.length >= 1 ||
      infoAditional.assertions.length >= 1 ||
      infoAditional.steps.length >= 1
    ) {
      this._onClose();
      this.setState({ infoAditional });
    }
  };

  setSortColumn = column => {
    const { sortColumn, data, searchTermTest } = this.state;
    let order = '';
    if (sortColumn.column === column) {
      if (sortColumn.order === '') {
        order = 'ascendant';
      } else if (sortColumn.order === 'ascendant') {
        order = 'descent';
      } else {
        order = '';
      }
    } else if (sortColumn.column === '' || sortColumn.column !== column) {
      order = 'ascendant';
    }
    if (sortColumn.column === column && sortColumn.order === 'descent') {
      column = '';
    }
    this.loadData(data, searchTermTest, {
      column: column,
      order: order
    });
    this.setState({
      sortColumn: {
        column: column,
        order: order
      }
    });
  };

  loadData = (test, searchTerm, sortColumn) => {
    let finalList = test;
    if (searchTerm !== '') {
      const filteredData = finalList.filter(item => {
        return Object.keys(item).some(key => {
          if (KEYS_TO_FILTERS.find(KEY => KEY === key)) {
            return `${item[key]}`
              .toLowerCase()
              .includes(searchTerm.trim().toLowerCase());
          }
          return false;
        });
      });
      finalList = filteredData;
    }
    finalList = this.sortData(finalList, sortColumn);
    this.calcTable(finalList);
    this.setState({ data: finalList });
  };

  sortData = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'name':
        // eslint-disable-next-line no-case-declarations
        const sortName = finalList.sort(function(a, b) {
          if (a.name > b.name) {
            return valueOne;
          }
          if (a.name < b.name) {
            return valueTwo;
          }
          return 0;
        });
        return sortName;
      case 'type':
        // eslint-disable-next-line no-case-declarations
        const sortType = finalList.sort(function(a, b) {
          if (a.type > b.type) {
            return valueOne;
          }
          if (a.type < b.type) {
            return valueTwo;
          }
          return 0;
        });
        return sortType;
      case 'status':
        // eslint-disable-next-line no-case-declarations
        const sortStatus = finalList.sort(function(a, b) {
          if (a.status > b.status) {
            return valueOne;
          }
          if (a.status < b.status) {
            return valueTwo;
          }
          return 0;
        });
        return sortStatus;
      case 'message':
        // eslint-disable-next-line no-case-declarations
        const sortMessage = finalList.sort(function(a, b) {
          if (a.message > b.message) {
            return valueOne;
          }
          if (a.message < b.message) {
            return valueTwo;
          }
          return 0;
        });
        return sortMessage;
      case 'location':
        // eslint-disable-next-line no-case-declarations
        const sortLocation = finalList.sort(function(a, b) {
          if (a.location > b.location) {
            return valueOne;
          }
          if (a.location < b.location) {
            return valueTwo;
          }
          return 0;
        });
        return sortLocation;
      default:
        return finalList;
    }
  };

  /**
   * method that calculates the total number of pages to show
   *
   * @memberof Migration
   */
  calcTable = finalList => {
    const { totalRows, pagePag } = this.state;
    const aux = finalList.length % totalRows;
    let totalPages = 0;
    if (aux === 0) {
      totalPages = finalList.length / totalRows;
    } else {
      totalPages = Math.trunc(finalList.length / totalRows) + 1;
    }

    let pageNext = 0;
    if (pagePag < totalPages - 1 || pagePag === totalPages - 1) {
      pageNext = pagePag;
    } else if (pagePag > totalPages - 1) {
      pageNext = totalPages <= 0 ? 0 : totalPages - 1;
    }
    this.setState({ pages: totalPages, pagePag: pageNext });
  };

  downloadData = async () => {
    const { dataRespaldo } = this.state;
    const date = new Date();
    const zip = new JSZip();
    const dataCsv = [];
    dataRespaldo.forEach((row, index) => {
      dataCsv.push({
        NAME: row.name ? row.name : '-----',
        TYPE: row.type ? row.type : '-----',
        LOCATION: row.location ? row.location : '-----',
        STATUS: row.status ? row.status : '-----',
        MESSAGE: row.message ? row.message : '-----',
        HOST: '-----',
        URL: '-----',
        METHOD: '-----',
        QUERY: '-----',
        VARIABLES_NAME: '-----',
        VARIABLES_ID: '-----',
        VARIABLES_DESCRIPTION: '-----',
        VARIABLES_SECURE: '-----',
        VARIABLES_VALUE: '-----',
        VARIABLES_TAGS: '-----',
        ASSERTIONS_VALUE: '-----',
        STEPS_PARAMS: '-----',
        STEPS_TYPE: '-----'
      });
      if (
        row.host === '-----' ||
        row.url === '-----' ||
        row.method === '-----' ||
        row.query === '-----'
      ) {
        dataCsv[index].HOST = row.host ? row.host : '-----';
        dataCsv[index].URL = row.url ? row.url : '-----';
        dataCsv[index].METHOD = row.method ? row.method : '-----';
        dataCsv[index].QUERY = row.query ? row.query : '-----';
      }
      if (row.variables.length >= 1) {
        for (const iteratorVariable of row.variables) {
          dataCsv.push({
            NAME: row.name ? row.name : '-----',
            TYPE: row.type ? row.type : '-----',
            LOCATION: row.location ? row.location : '-----',
            STATUS: row.status ? row.status : '-----',
            MESSAGE: row.message ? row.message : '-----',
            HOST: '-----',
            URL: '-----',
            METHOD: '-----',
            QUERY: '-----',
            VARIABLES_NAME: iteratorVariable.name
              ? iteratorVariable.name
              : '-----',
            VARIABLES_ID: iteratorVariable.id ? iteratorVariable.id : '-----',
            VARIABLES_DESCRIPTION: iteratorVariable.description
              ? iteratorVariable.description
              : '-----',
            VARIABLES_SECURE: iteratorVariable.secure
              ? iteratorVariable.secure
              : '-----',
            VARIABLES_VALUE: iteratorVariable.value
              ? iteratorVariable.value
              : '-----',
            VARIABLES_TAGS: iteratorVariable.tags
              ? iteratorVariable.tags
              : '-----',
            ASSERTIONS_VALUE: '-----',
            STEPS_PARAMS: '-----',
            STEPS_TYPE: '-----'
          });
        }
      }
      if (row.assertions.length >= 1) {
        for (const iteratorAssertion of row.assertions) {
          dataCsv.push({
            NAME: row.name ? row.name : '-----',
            TYPE: row.type ? row.type : '-----',
            LOCATION: row.location ? row.location : '-----',
            STATUS: row.status ? row.status : '-----',
            MESSAGE: row.message ? row.message : '-----',
            HOST: '-----',
            URL: '-----',
            METHOD: '-----',
            QUERY: '-----',
            VARIABLES_NAME: '-----',
            VARIABLES_ID: '-----',
            VARIABLES_DESCRIPTION: '-----',
            VARIABLES_SECURE: '-----',
            VARIABLES_VALUE: '-----',
            VARIABLES_TAGS: '-----',
            ASSERTIONS_VALUE: iteratorAssertion.value
              ? iteratorAssertion.value
              : '-----',
            STEPS_PARAMS: '-----',
            STEPS_TYPE: '-----'
          });
        }
      }
      if (row.steps.length >= 1) {
        for (const iteratorStep of row.steps) {
          dataCsv.push({
            NAME: row.name ? row.name : '-----',
            TYPE: row.type ? row.type : '-----',
            LOCATION: row.location ? row.location : '-----',
            STATUS: row.status ? row.status : '-----',
            MESSAGE: row.message ? row.message : '-----',
            HOST: '-----',
            URL: '-----',
            METHOD: '-----',
            QUERY: '-----',
            VARIABLES_NAME: '-----',
            VARIABLES_ID: '-----',
            VARIABLES_DESCRIPTION: '-----',
            VARIABLES_SECURE: '-----',
            VARIABLES_VALUE: '-----',
            VARIABLES_TAGS: '-----',
            ASSERTIONS_VALUE: '-----',
            STEPS_PARAMS: iteratorStep.params ? iteratorStep.params : '-----',
            STEPS_TYPE: iteratorStep.type ? iteratorStep.type : '-----'
          });
        }
      }
    });

    jsoncsv.json2csv(dataCsv, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Synthetics.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        // see FileSaver.js
        saveAs(
          content,
          `Synthetics ${date.getDate()}-${date.getMonth() +
            1}-${date.getFullYear()}.zip`
        );
      });
    });
  };

  render() {
    const {
      loading,
      savingAllChecks,
      pagePag,
      pages,
      totalRows,
      hidden,
      sortColumn,
      infoAditional,
      data,
      modal
    } = this.state;
    const { testTotal = 0 } = this.props;
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <div className="mainContent">
            <div className="mainContent__information">
              <div className="information__box">
                <span
                  className=" box--title fontMedium "
                  style={{
                    color: greenColor
                  }}
                >
                  Total tests
                </span>
                <div>
                  <span
                    className="box--quantity fontBigger "
                    style={{
                      color: greenColor
                    }}
                  >
                    {testTotal}
                  </span>
                </div>
              </div>
            </div>
            <div className="mainContent__tableContent">
              <div className="tableContent__filter">
                <div className="filters__search">
                  <div className="search__content">
                    <BsSearch size="10px" color="#767B7F" />
                    <SearchInput
                      className="filters--searchInput"
                      onChange={this.searchUpdated}
                    />
                  </div>
                </div>
                <div
                  className={
                    data.length === 0
                      ? 'pointerBlock flex flexCenterVertical'
                      : 'pointer flex flexCenterVertical'
                  }
                  style={{ width: '30%' }}
                  onClick={() => {
                    if (data.length !== 0) this.downloadData();
                  }}
                >
                  <Tooltip
                    placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
                    text="Download"
                  >
                    <img
                      src={iconDownload}
                      style={{ marginLeft: '20px' }}
                      height="18px"
                    />
                  </Tooltip>
                </div>
                {data.length !== 0 && (
                  <Pagination
                    page={pagePag}
                    pages={pages}
                    upPage={this.upPage}
                    goToPage={this.changePage}
                    downPage={this.downPage}
                  />
                )}
              </div>
              <div className="tableContent__table">
                <div style={{ width: '1338px' }} className="h100">
                  <ReactTable
                    loading={savingAllChecks}
                    loadingText="Processing..."
                    page={pagePag}
                    showPagination={false}
                    resizable={false}
                    data={data}
                    defaultPageSize={totalRows}
                    getTrProps={(state, rowInfo) => {
                      // eslint-disable-next-line no-lone-blocks
                      {
                        if (rowInfo) {
                          return {
                            style: {
                              background:
                                rowInfo.index % 2 ? '#F7F7F8' : 'white',
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate: '1fr/ repeat(5,20%)'
                            }
                          };
                        } else {
                          return {
                            style: {
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate: '1fr/  repeat(5,20%)'
                            }
                          };
                        }
                      }
                    }}
                    getTrGroupProps={() => {
                      return {
                        style: {
                          borderBottom: 'none'
                        }
                      };
                    }}
                    getNoDataProps={() => {
                      return {
                        style: {
                          marginTop: '60px'
                        }
                      };
                    }}
                    getTheadTrProps={() => {
                      return {
                        style: {
                          background: '#F7F7F8',
                          color: '#333333',
                          fontWeight: 'bold',
                          display: 'grid',
                          gridTemplate: '1fr/  repeat(5,20%)'
                        }
                      };
                    }}
                    columns={[
                      {
                        Header: () => (
                          <div className="darkLine table__headerSticky fontSmall">
                            <div
                              className="pointer flex "
                              style={{ marginLeft: '15px' }}
                              onClick={() => {
                                this.setSortColumn('name');
                              }}
                            >
                              NAME
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'name' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'name' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'stycky w100I',
                        className:
                          ' stycky table__cellSticky fontNormal h100 w100I',
                        accessor: 'name',
                        sortable: false,
                        Cell: props => {
                          return (
                            <div
                              onClick={() =>
                                modal
                                  ? this.saveAction('data', props.original)
                                  : ''
                              }
                              className={`darkLine h100 flex flexCenterVertical ${
                                modal ? 'pointer' : ''
                              }`}
                              style={{
                                background:
                                  props.index % 2 ? '#F7F7F8' : 'white',
                                color: modal ? '#0078BF' : 'none'
                              }}
                            >
                              <span style={{ marginLeft: '15px' }}>
                                {props.value}
                              </span>
                            </div>
                          );
                        }
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('type');
                              }}
                            >
                              TYPE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'type' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'type' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'type',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical">
                            {props.value}
                          </div>
                        )
                      },

                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('location');
                              }}
                            >
                              LOCATION
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'location' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'location' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'location',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('status');
                              }}
                            >
                              STATUS
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'status' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'status' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'status',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('message');
                              }}
                            >
                              MESSAGE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'message' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'message' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'message',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical">
                            {props.value}
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {hidden && (
          <ModalSynthetics
            hidden={hidden}
            _onClose={this._onClose}
            infoAditional={infoAditional}
          />
        )}
      </div>
    );
  }
}

Synthetics.propTypes = {
  testTotal: PropTypes.number.isRequired,
  testList: PropTypes.array.isRequired
};
