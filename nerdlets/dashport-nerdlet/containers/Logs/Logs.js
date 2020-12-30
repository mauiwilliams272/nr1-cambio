import React from 'react';
import { Spinner } from 'nr1';
import PropTypes from 'prop-types';
import TableArchives from './TableArchives';
import TableMetrics from './TableMetrics';
import TablePipelines from './TablePipelines';

const greenColor = '#007E8A';
export default class Logs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataPipeline: [],
      dataPipelineTotal: [],
      dataMetrics: [],
      dataMetricsTotal: 0,
      dataArchives: [],
      dataArchivesTotal: 0,
      timeRanges: [
        { value: 'Pipelines', label: 'Pipelines' },
        { value: 'Archives', label: 'Archives' },
        { value: 'Metrics', label: 'Metrics' }
      ],
      rangeSelected: { value: 'Pipelines', label: 'Pipelines' },
      loading: true
    };
  }

  componentDidMount() {
    const { logsData = [] } = this.props;
    if (logsData.pipelines) {
      this.setState({
        dataPipeline: logsData.pipelines,
        dataPipelineTotal: logsData.pipelines.length
      });
    }
    if (logsData.archives) {
      this.setState({
        dataArchives: logsData.archives,
        dataArchivesTotal: logsData.archives.length
      });
    }
    if (logsData.metrics) {
      this.setState({
        dataMetrics: logsData.metrics,
        dataMetricsTotal: logsData.metrics.length
      });
    }
    this.setState({ loading: false });
  }

  handleRange = value => {
    this.setState({ rangeSelected: value });
  };

  selectViewLogs = () => {
    const {
      rangeSelected,
      timeRanges,
      dataArchives,
      dataMetrics,
      dataPipeline
    } = this.state;
    switch (rangeSelected.value) {
      case 'Pipelines':
        return (
          <TablePipelines
            rangeSelected={rangeSelected}
            timeRanges={timeRanges}
            handleRange={this.handleRange}
            dataPipeline={dataPipeline}
          />
        );
      case 'Archives':
        return (
          <TableArchives
            rangeSelected={rangeSelected}
            timeRanges={timeRanges}
            handleRange={this.handleRange}
            dataArchives={dataArchives}
          />
        );
      case 'Metrics':
        return (
          <TableMetrics
            rangeSelected={rangeSelected}
            timeRanges={timeRanges}
            handleRange={this.handleRange}
            dataMetrics={dataMetrics}
          />
        );
      default:
        return <div />;
    }
  };

  render() {
    const {
      loading,
      dataArchivesTotal,
      dataMetricsTotal,
      dataPipelineTotal
    } = this.state;
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <div className="mainContent">
            <div className="mainContentLogs__information">
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Total Pipelines
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {dataPipelineTotal}
                  </span>
                </div>
              </div>
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Total Archives
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {dataArchivesTotal}
                  </span>
                </div>
              </div>
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Total Metrics
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {dataMetricsTotal}
                  </span>
                </div>
              </div>
            </div>

            <div className="mainContent__tableContent">
              {this.selectViewLogs()}
            </div>
          </div>
        )}
      </div>
    );
  }
}
Logs.propTypes = {
  logsData: PropTypes.object.isRequired
};
