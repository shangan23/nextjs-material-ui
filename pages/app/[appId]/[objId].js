import React from 'react';
import initialize from '../../../utils/initialize';
import { connect } from 'react-redux';
import absoluteUrl from "next-absolute-url";
import { dynamicSort } from '../../../utils/helper';
import {
  Grid
} from '@material-ui/core';
import { getCookie } from '../../../utils/cookie';
import moduleController from '../../../modules/controller';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Moment from 'react-moment';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';

const useStyles = theme => ({
  root: {
    width: '100%',
  },
  appBar: {
    top: theme.spacing(0),
    //marginLeft: theme.spacing(-2),
    position: 'relative'
  },
  toolbarStyle: {
    minHeight: theme.spacing(1),
    marginLeft: theme.spacing(-2)
  },
  paperDetails: {
    padding: theme.spacing(1),
    maxHeight: theme.spacing(63.5),
    overflow: 'scroll',
  },
  Section: {
    padding: theme.spacing(3),
    minHeight: theme.spacing(20)
  },
  grow: {
    flexGrow: 1,
  },
  completed: {
    display: 'inline-block',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
});

const frameURL = async (req) => {
  let user, host, cleanUser, urlObj, headers = {};
  user = getCookie('user', req);
  cleanUser = unescape(user);
  cleanUser = JSON.parse(cleanUser);
  headers['Authorization'] = `Basic ${cleanUser.token}`;
  headers['Content-Type'] = 'application/json';
  host = absoluteUrl(req, req.headers.host);
  urlObj = new URL(`${host.origin}${req.url}`);
  let module, object, modulePath;
  let { origin, pathname } = urlObj;
  modulePath = pathname.replace('/app/', '');
  modulePath = modulePath.split('/');
  module = modulePath[0];
  object = modulePath[1];
  console.log('iServer module', module);
  console.log('iServer object', object);
  const objData = await fetch(`${origin}/api/app/${module}/${object}`);
  const objJson = await objData.json();
  return { module, objJson }
};

function getSteps() {
  return ['Item Details', 'Add Items', 'Adjust Stocks'];
}

class DynamicCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeStep: 0, completed: {} };
  }

  static async getInitialProps(ctx) {
    await initialize(ctx);
    const { req } = ctx;
    if (!req) {
      const fullUrl = `${window.location.protocol}//${window.location.hostname}${(window.location.port ? ':' + window.location.port : '')}`;
      let module = ctx.query.appId;
      let object = ctx.query.objId;
      const objData = await fetch(`${fullUrl}/api/app/${module}/${object}`);
      const objJson = await objData.json();
      return { module: module, objJson: objJson };
    } else {
      const { module, objJson } = await frameURL(req);
      return { module, objJson };
    }
  }

  render() {

    const steps = getSteps();
    const { classes } = this.props;

    const totalSteps = () => {
      return steps.length;
    };

    const completedSteps = () => {
      return Object.keys(this.state.completed).length;
    };

    const isLastStep = () => {
      return this.state.activeStep === totalSteps() - 1;
    };

    const allStepsCompleted = () => {
      return completedSteps() === totalSteps();
    };

    const handleNext = () => {
      const newActiveStep =
        isLastStep() && !allStepsCompleted()
          ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in this.state.completed))
          : this.state.activeStep + 1;
      this.setState({ activeStep: newActiveStep });
      //setActiveStep(newActiveStep);
    };

    const handleBack = () => {
      //setActiveStep((prevActiveStep) => prevActiveStep - 1);
      this.setState({ activeStep: (prevActiveStep) => prevActiveStep - 1 });
    };

    const handleStep = (step) => () => {
      //setActiveStep(step);
      this.setState({ activeStep: step });
    };

    const handleComplete = () => {
      const newCompleted = this.state.completed;
      newCompleted[this.state.activeStep] = true;
      this.setState({ completed: newCompleted });
      //setCompleted(newCompleted);
      handleNext();
    };

    const handleReset = () => {
      //setActiveStep(0);
      this.setState({ activeStep: 0 });
      this.setState({ completed: {} });
      //setCompleted({});
    };

    let module = this.props.module;
    let fieldsToRender = moduleController(module, this.props.siteInfo);
    let object = this.props.objJson;

    console.log(object);
    let objTitle, objCreatedBy;
    fieldsToRender.filter(function (obj) {
      if (obj.primary) {
        objTitle = object[obj.id];
      }
      if (obj.fk && obj.id === 'fk_createdBy') {
        objCreatedBy = object['fk_createdBy'].fullName;
      }
    });



    fieldsToRender.sort(dynamicSort('section'));

    //&& fieldsToRender[index]['options']['display']== null
    const renderFields = (
      <Grid container spacing={2} className={classes.fields} key={`grid-form${Math.random()}`}>
        {
          fieldsToRender.map((data, index) => (
            <React.Fragment key={`layout-frag${Math.random()}`}>
              {
                (
                  (index === 0) ?
                    <Grid item xs={12} md={12}>
                      <Typography color="primary" variant="overline">{fieldsToRender[index]['section']}</Typography>
                    </Grid> :
                    (fieldsToRender[index]['section'] != fieldsToRender[(index - 1)]['section']) ?
                      <React.Fragment key={`layout-frag${Math.random()}`}>
                        <Grid item xs={12} md={12}>
                          <Typography color="primary" variant="overline">{fieldsToRender[index]['section']}</Typography>
                        </Grid>
                      </React.Fragment> :
                      ''
                )
              }
              {
                (
                  (fieldsToRender[index]['type'] == 'Date') &&
                  <Grid item xs={12} md={4} key={index}>
                    <Typography variant="body2">{fieldsToRender[index]['label']}:</Typography><Typography variant="body1"><Moment format={this.props.siteInfo.dateFormat}>{object[fieldsToRender[index]['iddd']]}</Moment></Typography>
                  </Grid>
                  || (fieldsToRender[index]['type'] == 'Lookup') &&
                  <Grid item xs={12} md={4} key={index}>
                    <Typography variant="body2">{fieldsToRender[index]['label']}:</Typography><Typography variant="body1">{object[fieldsToRender[index]['id']][fieldsToRender[index]['moduleField']]}</Typography>
                  </Grid>
                  || (fieldsToRender[index]['id'] != 'action') &&
                  <Grid item xs={12} md={4} key={index}>
                    <Typography variant="body2"> {fieldsToRender[index]['label']}:</Typography><Typography variant="body1">{object[fieldsToRender[index]['id']]}</Typography>
                  </Grid>
                  || (fieldsToRender[index]['id'] != 'id') &&
                  <Grid item xs={12} md={4} key={index}>
                    <Typography variant="body2"> {fieldsToRender[index]['label']}:</Typography><Typography variant="body1">{object[fieldsToRender[index]['id']]}</Typography>
                  </Grid>
                )
              }
            </React.Fragment>
          ))
        }
      </Grid>
    );

    const getStepContent = (step) => {
      switch (step) {
        case 0:
          return renderFields;
        case 1:
          return 'Step 2: What is an ad group anyways?';
        case 2:
          return 'Step 3: This is the bit I really care about!';
        default:
          return 'Unknown step';
      }
    }

    const stepRender = (<div className={classes.root}>
      <div>
        {allStepsCompleted() ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed - you&apos;re finished
            </Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
            <div>
              <Typography className={classes.instructions}>{getStepContent(this.state.activeStep)}</Typography>
            </div>
          )}
      </div>
    </div>);

    return (
      <Grid container spacing={0} key={`${Math.random()}`}>
        <Grid item xs={12} md={12}>
          <AppBar elevation={0} position="fixed" color="inherit" className={classes.appBar}>
            <Toolbar className={classes.toolbarStyle} variant="dense">
              <div>
                <Typography variant="h6">{objTitle}</Typography>
                <Typography variant="caption">
                  Created on <Moment format={this.props.siteInfo.dateFormat}>{object.createdAt}</Moment> | Created By {objCreatedBy}
                </Typography>
              </div>
              <div className={classes.grow}>
              </div>
              <Stepper nonLinear activeStep={this.state.activeStep}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepButton onClick={handleStep(index)} completed={this.state.completed[index]}>
                      {label}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
            </Toolbar>
          </AppBar>
          <Paper elevation={0} variant="outlined" className={classes.paperDetails}>
            {stepRender}
          </Paper>
        </Grid>
      </Grid >
    );
  }

}

function mapStateToProps(state) {
  return {
    siteInfo: state.siteSettings.settings,
  };
}

export default connect(
  mapStateToProps
)(withStyles(useStyles)(DynamicCreate));
