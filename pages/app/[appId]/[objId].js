import React from 'react';
import initialize from '../../../utils/initialize';
import { connect } from 'react-redux';
import absoluteUrl from "next-absolute-url";
import { dynamicSort } from '../../../utils/helper';
import { Grid } from '@material-ui/core';
import { getCookie } from '../../../utils/cookie';
import moduleController from '../../../modules/controller';
import modules from '../../../modules/index';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Moment from 'react-moment';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Link from 'next/Link';
import Router from 'next/router';

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
    minHeight: theme.spacing(63.5),
    overflow: 'scroll',
  },
  Section: {
    backgroundColor: '#FAFAFC',
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
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
  stepper:{
    padding:0
  }
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

class DynamicCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeStep: 0 };
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

    let module = this.props.module;
    let moduleMeta = modules(module);
    let steps = [], subApp = [];

    if (moduleMeta) {
      subApp = moduleMeta.subApp;
      if (subApp) {
        steps.push({ label: `${module.charAt(0).toUpperCase() + module.slice(1)} Detail`, id: module });
        subApp.map(obj => steps.push({ label: obj.lable.plural, id: obj.id }));
      }
    }

    const { classes } = this.props;

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

    const handleStep = (step) => () => {
      Router.push(
        '/app/[appId]/[objId]/[subAppId]',
        `/app/${module}/${object.id}/${steps[step].id}`
      );
    };

    fieldsToRender.sort(dynamicSort('section'));
    const renderFields = (
      <Grid container spacing={2} className={classes.fields} key={`grid-form${Math.random()}`}>
        {
          fieldsToRender.map((data, index) => (
            <React.Fragment key={`layout-frag${Math.random()}`}>
              {
                (
                  (index === 0) ?
                    <Grid className={classes.Section} item xs={12} md={12}>
                      <Typography color="secondary" variant="overline">{fieldsToRender[index]['section']}</Typography>
                    </Grid> :
                    (fieldsToRender[index]['section'] != fieldsToRender[(index - 1)]['section']) ?
                      <Grid className={classes.Section} item xs={12} md={12}>
                        <Typography color="secondary" variant="overline">{fieldsToRender[index]['section']}</Typography>
                      </Grid>
                      :
                      ''
                )
              }
              {
                (
                  (fieldsToRender[index]['type'] == 'Date') &&
                  <Grid item xs={12} md={4} key={index}>
                    <Typography variant="caption">{fieldsToRender[index]['label']}:</Typography><Typography variant="subtitle2"><Moment format={this.props.siteInfo.dateFormat}>{object[fieldsToRender[index]['iddd']]}</Moment></Typography>
                  </Grid>
                  || (fieldsToRender[index]['type'] == 'Currency') &&
                  <Grid item xs={12} md={4} key={index}>
                    <Typography variant="caption"> {fieldsToRender[index]['label']}:</Typography><Typography variant="subtitle2">&#8377;&nbsp;{object[fieldsToRender[index]['id']].toLocaleString('en-IN')}</Typography>
                  </Grid>
                  || (fieldsToRender[index]['type'] == 'Lookup') &&
                  <Grid item xs={12} md={4} key={index}>
                    <Typography variant="caption">{fieldsToRender[index]['label']}:</Typography>
                    <Typography variant="subtitle2">
                      <Link href="/app/[appId]/[objId]" as={`/app/${fieldsToRender[index]['module']}/${object[fieldsToRender[index]['id']].id}`}>
                        <a>{object[fieldsToRender[index]['id']][fieldsToRender[index]['moduleField']]}</a>
                      </Link>
                    </Typography>
                  </Grid>
                  || (fieldsToRender[index]['id'] != 'action') &&
                  <Grid item xs={12} md={4} key={index}>
                    <Typography variant="caption"> {fieldsToRender[index]['label']}:</Typography><Typography variant="subtitle2">{object[fieldsToRender[index]['id']]}</Typography>
                  </Grid>
                )
              }
            </React.Fragment>
          ))
        }
      </Grid>
    );

    const stepRender = (<div className={classes.root}>
      <div>
        <div>
          {renderFields}
        </div>
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
              <Stepper className={classes.stepper} nonLinear activeStep={this.state.activeStep}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepButton onClick={handleStep(index)}>
                      {label.label}
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