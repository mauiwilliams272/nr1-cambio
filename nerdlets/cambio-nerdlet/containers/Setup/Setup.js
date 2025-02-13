import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'nr1';
import { Formik, Form, Field } from 'formik';
// Schemas
import {
  DatadogTempSchema,
  DatadogSchema
} from '../../constants/ValidationSchemas';
import datadogAIcon from '../../images/datadogA.svg';
import stepOne from '../../images/stepOneIndicator.svg';
import stepTwo from '../../images/stepTwoIndicator.svg';
import stepOneDisabled from '../../images/stepOneIndicatorDisabled.svg';
import stepTwoDisabled from '../../images/stepTwoIndicatorDisabled.svg';
import eyeIcon from '../../images/eyeIconGray.svg';
import warningIcon from '../../images/warning.svg';
import { downloadJSON, downloadCSV } from '../../services/NerdStorage/api';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import iconInformation from '../../images/information.svg';
import ReactTooltip from 'react-tooltip';
import sucess from '../../images/success.svg';
import Modal from '../../components/ModalSetup';

const CustomInputComponent = ({ field, viewKeyAction, disabled, ...props }) => {
  return (
    <div className="buttonInside">
      <input
        type="text"
        {...field}
        {...props}
        className="inputApiKey fontSmall"
        disabled={disabled}
      />
      <img
        src={eyeIcon}
        className="buttonEye"
        onClick={() => {
          if (disabled) viewKeyAction(field.name);
        }}
      />
    </div>
  );
};
CustomInputComponent.propTypes = {
  field: PropTypes.object,
  viewKeyAction: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
};

/**
 * Class that render the setup Container
 * @export
 * @class Setup
 * @extends {React.PureComponent}
 */
export default class Setup extends React.PureComponent {
  /**
   * Creates an instance of Setup
   * @param {*} props
   * @memberof Accounts
   */
  constructor(props) {
    super(props);
  }

  state = {
    enableDownload: false,
    stepActive: 1,
    hidden: false
  };

  _onClose = () => {
    const actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  downloadData = () => {
    this.setState({ enableDownload: true });
    downloadJSON(this.enableButton);
  };

  downloadDataCSV = () => {
    this.setState({ enableDownload: true });
    downloadCSV(this.enableButton);
  };

  enableButton = () => {
    this.setState({ enableDownload: false });
  };

  openTab = () => {
    const win = window.open(
      'https://docs.datadoghq.com/account_management/api-app-keys/',
      '_blank'
    );
    win.focus();
  };

  returnStep = step => {
    const {
      appkeyS,
      writingSetup,
      setupComplete,
      apikeyS,
      writeSetup,
      fetchData,
      fetchingData,
      apikey,
      appkey,
      lastUpdate,
      completed,
      viewKeyAction,
      openToast,
      deleteSetup,
      hasErrorFetch
    } = this.props;
    const { enableDownload } = this.state;
    switch (step) {
      case 1:
        return (
          <div className="apiKeys__stepOne">
            <div className="stepOne__title">
              <div className="stepOne--title fontMedium">Datadog API</div>
              <span
                className="apiKeys--learnMore fontSmall"
                onClick={this.openTab}
              >
                Learn more
              </span>
            </div>
            <div className="stepOne__form">
              <Formik
                enableReinitialize
                initialValues={
                  setupComplete
                    ? {
                        apikey: apikeyS,
                        appkey: appkeyS
                      }
                    : {
                        apikey,
                        appkey
                      }
                }
                validationSchema={
                  setupComplete ? DatadogTempSchema : DatadogSchema
                }
                onSubmit={(values, actions) => writeSetup(values, actions)}
              >
                {({ errors, touched, submitForm }) => (
                  <Form className="form__setup" autoComplete="off">
                    <div className="setup__textsFields">
                      <div className="setup__textfield">
                        <div className="setup__label fontNormal"> 
                          API key
                          <div>
                            <a
                              data-for="custom-class-2"
                              data-tip="hover on me will keep the tooltip"
                            >
                              <img
                                height="10px"
                                src={iconInformation}
                                className="apiKeys--iconInfo"
                              />
                            </a>
                            <ReactTooltip
                              id="custom-class-2"
                              getContent={() => (
                                <p>
                                  An API key is required by the Datadog Api to
                                  get the elements of your account.&nbsp;
                                  <a
                                    onClick={() => this._onClose()}
                                    className="pointer"
                                    style={{
                                      color: 'yellow',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    Learn more
                                  </a>
                                </p>
                              )}
                              className="tooltip"
                              delayHide={1000}
                              effect="solid"
                            />
                          </div>
                        </div>
                        <Field
                          name="apikey"
                          component={CustomInputComponent}
                          viewKeyAction={viewKeyAction}
                          disabled={setupComplete}
                        />
                        {errors.apikey && touched.apikey ? (
                          <div className="fontNormal" style={{ color: 'red' }}>
                            {errors.apikey}
                          </div>
                        ) : (
                          <div
                            className="fontNormal"
                            style={{ color: 'white' }}
                          >
                            ....
                          </div>
                        )}
                      </div>
                      <div className="setup__textfield">
                        <div className="setup__label fontNormal">
                          Application key
                          <div>
                            <a
                              data-for="custom-class"
                              data-tip="hover on me will keep the tooltip"
                            >
                              <img
                                height="10px"
                                src={iconInformation}
                                className="apiKeys--iconInfo"
                              />
                            </a>
                            <ReactTooltip
                              id="custom-class"
                              getContent={() => (
                                <p>
                                  An Application key is required by the Datadog
                                  Api. It is used to log all requests made to
                                  the API.&nbsp;
                                  <a
                                    onClick={() => this._onClose()}
                                    className="pointer"
                                    style={{
                                      color: 'yellow',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    Learn more
                                  </a>
                                </p>
                              )}
                              className="tooltip"
                              delayHide={1000}
                              effect="solid"
                            />
                          </div>
                        </div>
                        <Field
                          name="appkey"
                          component={CustomInputComponent}
                          viewKeyAction={viewKeyAction}
                          disabled={setupComplete}
                        />
                        {errors.appkey && touched.appkey ? (
                          <div className="fontNormal" style={{ color: 'red' }}>
                            {errors.appkey}
                          </div>
                        ) : (
                          <div
                            className="fontNormal"
                            style={{ color: 'white' }}
                          >
                            ....
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flexCenterHorizontal ">
                      {setupComplete ? (
                        <Button
                          onClick={openToast}
                          type={Button.TYPE.DESTRUCTIVE}
                          loading={writingSetup || deleteSetup}
                          // iconType={
                          //   Icon.TYPE.INTERFACE__OPERATIONS__TRASH
                          // }
                          className="buttonsSetup__buttonDelete fontNormal"
                        >
                          Delete config
                        </Button>
                      ) : (
                        <Button
                          onClick={submitForm}
                          type={Button.TYPE.PRIMARY}
                          loading={writingSetup}
                          disabled={!!setupComplete}
                          className="buttonsSetup__buttonSave"
                        >
                          Validate
                        </Button>
                      )}
                    </div>
                    <div className="flex flexCenterVertical flexCenterHorizontal">
                      <div style={{ height: '23px', width: '33%' }}>
                        {setupComplete && <img src={sucess} />}
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        );
      case 2:
        return lastUpdate === 'never' ? (
          <div className="apiKeys__stepTwo">
            <div className="stepTwo--title fontMedium">
              {' '}
              Fetch Datadog Elements
            </div>
            <div className="stepTwo__fetchSection">
              <div
                className="flex flexCenterHorizontal flexCenterVertical"
                style={{ paddingLeft: '10px', paddingRight: '10px' }}
              >
                {fetchingData && (
                  <ProgressBar bgcolor="#007E8A" completed={completed} />
                )}
              </div>
              <div className="flex flexCenterHorizontal flexCenterVertical">
                <Button
                  onClick={() => {
                    fetchData();
                  }}
                  type={Button.TYPE.PRIMARY}
                  // iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                  loading={fetchingData}
                  className="fetchSection--buttonFetch fontMedium"
                  disabled={!(apikey !== '' && appkey !== '') || enableDownload}
                >
                  Fetch Elements
                </Button>
              </div>
              <div className="flex flexCenterHorizontal">
                <div className="fetchSection--lastUpdate fontMedium">
                  {'Last update: '}
                  {lastUpdate}
                </div>
              </div>
              {fetchingData && (
                <div style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                  <div className="fetchSection__warningInfo flex flexCenterHorizontal">
                    <div style={{ width: '97%', marginTop: '3%' }}>
                      <img
                        style={{
                          width: '20px',
                          height: '20px'
                        }}
                        src={warningIcon}
                      />
                      <span className="warningInfo--title fontNormal">
                        Important Information
                      </span>
                      <p className="warningInfo--description fontSmall">
                        <span className="warningInfo--steps">
                          This process may take more than 30 minutes.
                        </span>{' '}
                        <br />
                        <span className="warningInfo--steps">
                          This browser tab should not close until the process is
                          complete.
                        </span>{' '}
                        <br />
                        <span className="warningInfo--steps">
                          Your internet connection must be active to complete
                          the process.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="apiKeys__stepTwo">
            <div className="stepTwo--title">Fetch Datadog Elements</div>
            <div className="stepTwo__fetchSection">
              <div
                className="flex flexCenterHorizontal flexCenterVertical"
                style={{ paddingLeft: '10px', paddingRight: '10px' }}
              >
                {fetchingData ? (
                  <ProgressBar bgcolor="#007E8A" completed={completed} />
                ) : (
                  <ProgressBar
                    bgcolor="#007E8A"
                    completed={hasErrorFetch ? completed : 100}
                  />
                )}
              </div>
              <div className="flex flexCenterHorizontal flexCenterVertical">
                <Button
                  onClick={() => {
                    fetchData();
                  }}
                  type={Button.TYPE.PRIMARY}
                  // iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                  loading={fetchingData}
                  className="fetchSection--buttonFetch fontMedium"
                  disabled={!(apikey !== '' && appkey !== '') || enableDownload}
                >
                  Fetch Elements
                </Button>
              </div>
              <div className="flex flexCenterHorizontal">
                <div className="fetchSection--lastUpdate fontMedium">
                  {'Last update: '}
                  {lastUpdate}
                </div>
              </div>
              {fetchingData && (
                <div style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                  <div className="fetchSection__warningInfo flex flexCenterHorizontal">
                    <div style={{ width: '97%', marginTop: '3%' }}>
                      <img
                        style={{
                          width: '20px',
                          height: '20px'
                        }}
                        src={warningIcon}
                      />
                      <span className="warningInfo--title fontNormal">
                        Important Information
                      </span>
                      <p className="warningInfo--description fontSmall">
                        <span className="warningInfo--steps">
                          This process may take more than 30 minutes.
                        </span>{' '}
                        <br />
                        <span className="warningInfo--steps">
                          This browser tab should not close until the process is
                          complete.
                        </span>{' '}
                        <br />
                        <span className="warningInfo--steps">
                          Your internet connection must be active to complete
                          the process.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  changeStep = step => {
    this.setState({ stepActive: step });
  };

  render() {
    const { setupComplete, fetchingData, deleteSetup } = this.props;
    const { stepActive, hidden } = this.state;
    return (
      <div className="mainSetup">
        <div className="mainSetup__content">
          {stepActive === 1 ? (
            <div className="content__information">
              <div className="information__step">
                <span className="step--title">Step</span>
                <img src={stepOne} height="35px" />
              </div>
              <span className="information--description fontMedium">
                Connect
              </span>
              <div
                onClick={() => {
                  if (setupComplete && !deleteSetup) this.changeStep(2);
                }}
                className="pointer"
              >
                <img src={stepTwoDisabled} height="35px" />
              </div>
            </div>
          ) : (
            <div className="content__information">
              <div className="information__step">
                <span className="step--title">Step</span>
                <div
                  onClick={() => {
                    if (!fetchingData) this.changeStep(1);
                  }}
                  className="pointer"
                >
                  <img src={stepOneDisabled} height="35px" />
                </div>
                <img
                  src={stepTwo}
                  style={{ marginLeft: '15px' }}
                  height="35px"
                />
              </div>
              <span className="information--description">Capture</span>
            </div>
          )}
          <div className="content__setup">
            <div>
              <li
                className="setup__iconOfPlatafform"
                style={{ border: '1px solid #007E8A' }}
                key={0}
              >
                <div className="iconOfPlatafform__content">
                  <img width="46px" height="46px" src={datadogAIcon} />
                </div>
              </li>
            </div>
            <div className="setup__configuration">
              <div className="configuration__apiKeys">
                {this.returnStep(stepActive)}
              </div>
            </div>
            <div className="setup__buttonNext">
              {setupComplete && stepActive === 1 && (
                <Button
                  onClick={() => this.changeStep(2)}
                  type={Button.TYPE.PRIMARY}
                  className="buttonsSetup__buttonNextOne fontNormal"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
        <Modal hidden={hidden} _onClose={this._onClose} />
      </div>
    );
  }
}

Setup.propTypes = {
  writeSetup: PropTypes.func.isRequired,
  openToast: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  appkeyS: PropTypes.string.isRequired,
  apikeyS: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  appkey: PropTypes.string.isRequired,
  lastUpdate: PropTypes.string.isRequired,
  setupComplete: PropTypes.bool.isRequired,
  fetchingData: PropTypes.bool.isRequired,
  writingSetup: PropTypes.bool.isRequired,
  completed: PropTypes.number.isRequired,
  viewKeyAction: PropTypes.func.isRequired,
  deleteSetup: PropTypes.bool.isRequired,
  hasErrorFetch: PropTypes.bool.isRequired
};
