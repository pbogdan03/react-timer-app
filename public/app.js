const TimersDashboard = React.createClass({
  getInitialState: function() {
    return {
      timers: [],
      serverError: false,
      timerFromError: null
    };
  },

  componentDidMount: function() {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 5000);
  },

  loadTimersFromServer: function() {
    client.getTimers((timers) => {
      this.setState({ timers });
    });
  },

  handleCreateFormSubmit: function(timer) {
    this.createTimer(timer);
  },

  handleEditFormSubmit: function(attrs) {
    this.updateTimer(attrs);
  },

  handleDelete: function(id) {
    this.deleteTimer(id);
  },

  handleStartClick: function(id) {
    this.startTimer(id);
  },

  handleStopClick: function(id) {
    this.stopTimer(id);
  },

  handleError: function(error, timer) {
    console.log('Server status: ', error.response.status);
    console.log('Server error: ', error.response.statusText);

    this.loadTimersFromServer();

    this.setState({
      serverError: true,
      timerFromError: timer
    });
  },

  createTimer: function(timer) {
    const t = helpers.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(t)
    });

    client.createTimer(t, (err) => {
      this.handleError(err, t);
    });
  },

  updateTimer: function(attrs) {
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === attrs.id) {
          return Object.assign({}, timer, {
            title: attrs.title,
            project: attrs.project
          });
        } else {
          return timer;
        }
      })
    });

    client.updateTimer(attrs);
  },

  deleteTimer: function(id) {
    this.setState({
      timers: this.state.timers.filter(timer => timer.id !== id)
    });

    client.deleteTimer({id});
  },

  startTimer: function(id) {
    const now = Date.now();

    this.setState({
      timers: this.state.timers.map((timer) => {
        if(timer.id === id) {
          return {
            ...timer,
            runningSince: now
          }
        } else {
          return timer;
        }
      })
    });

    client.startTimer({
      id,
      start: now
    })
  },

  stopTimer: function(id) {
    const now = Date.now();

    this.setState({
      timers: this.state.timers.map((timer) => {
        if(timer.id === id) {
          const lastElapsed = now - timer.runningSince;
          return {
            ...timer,
            elapsed: timer.elapsed + lastElapsed,
            runningSince: null
          }
        } else {
          return timer;
        }
      })
    });

    client.stopTimer({
      id,
      stop: now
    })
  },

  render: function() {
    return (
      <div className="ui three column centered grid">
        <div className="column">
          <EditableTimerList
            timers={this.state.timers}
            onFormSubmit={this.handleEditFormSubmit}
            onDeleteClick={this.handleDelete}
            onStartClick={this.handleStartClick}
            onStopClick={this.handleStopClick} />
          <ToggleableTimerForm
            onFormSubmit={this.handleCreateFormSubmit}
            isOpen={this.state.serverError}
            timer={this.state.timerFromError} />
        </div>
      </div>
    );
  }
});

const EditableTimerList = React.createClass({
  render: function() {
    const timers = this.props.timers.map((timer) => {
      return (
        <EditableTimer
          key={timer.id}
          id={timer.id}
          title={timer.title}
          project={timer.project}
          elapsed={timer.elapsed}
          runningSince={timer.runningSince}
          onFormSubmit={this.props.onFormSubmit}
          onDeleteClick={this.props.onDeleteClick}
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick} />
      );
    });

    return (
      <div id="timers">
        {timers}
      </div>
    );
  }
});

const EditableTimer = React.createClass({
  getInitialState: function() {
    return {
      editFormOpen: false,
    }
  },

  handleFormClose: function() {
    this.closeForm();
  },

  handleEditClick: function() {
    this.openForm();
  },

  handleSubmit: function(timer) {
    this.props.onFormSubmit(timer);
    this.closeForm();
  },

  closeForm: function() {
    this.setState({editFormOpen: false});
  },

  openForm: function() {
    this.setState({editFormOpen: true});
  },

  render: function() {
    if (this.state.editFormOpen) {
      return (
        <TimerForm
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          onFormClose={this.handleFormClose}
          onFormSubmit={this.handleSubmit} />
      );
    } else {
      return (
        <Timer
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onEditClick={this.handleEditClick}
          onDeleteClick={this.props.onDeleteClick}
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick} />
      );
    }
  }
});

const TimerForm = React.createClass({
  getInitialState: function() {
    return {
      titleVal: '',
      isTitleValid: true,
      projectVal: '',
      isProjectValid: true,
      serverError: this.props.error
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if(this.state.serverError !== nextProps.error) {
      this.setState({
        serverError: nextProps.error
      });
    }
  },

  componentDidMount: function() {
    this.setState({
      titleVal: this.refs.title.value,
      projectVal: this.refs.project.value
    });
  },

  handleSubmit: function() {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.refs.title.value,
      project: this.refs.project.value
    });
  },

  handleTitleChange: function(ev) {
    this.setState({
      titleVal: ev.target.value
    }, this.validateTitle);
  },

  handleProjectChange: function(ev) {
    this.setState({
      projectVal: ev.target.value
    }, this.validateProject);
  },

  validateTitle: function() {
    this.setState({
      isTitleValid: this.state.titleVal
    });
  },

  validateProject: function() {
    this.setState({
      isProjectValid: this.state.projectVal
    });
  },

  render: function() {
    const submitText = this.props.id ? 'Update' : 'Create';
    return (
      <div className="ui centered card">
        <div className="content">
          <div className={"ui form" + (this.state.serverError ? ' error' : '')}>
            {this.state.serverError &&
              <div className="ui error message">
                <div className="header">Server not responding...</div>
                <p>Please try again.</p>
              </div>
            }
            <div className={"field" + (this.state.isTitleValid ? '' : ' error')}>
              <label>Title</label>
              {!this.state.isTitleValid &&
                <p className="input-error-msg">This field cannot be empty</p>
              }
              <input type="text" ref="title" defaultValue={this.props.title} onChange={this.handleTitleChange}/>
            </div>
            <div className={"field" + (this.state.isProjectValid ? '' : ' error')}>
              <label>Project</label>
              {!this.state.isProjectValid &&
                <p className="input-error-msg">This field cannot be empty</p>
              }
              <input type="text" ref="project" defaultValue={this.props.project} onChange={this.handleProjectChange}/>
            </div>
            <div className="ui two bottom attached buttons">
              <button
                className="ui basic blue button"
                onClick={this.handleSubmit} >
                {submitText}
              </button>
              <button
                className="ui basic red button"
                onClick={this.props.onFormClose} >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

const ToggleableTimerForm = React.createClass({
  getInitialState: function() {
    return {
      isOpen: this.props.isOpen,
      title: '',
      project: '',
      error: false
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if(this.props.isOpen !== nextProps.isOpen) {
      this.setState({
        isOpen: nextProps.isOpen
      });
    }

    if(nextProps.timer) {
      this.setState({
        title: nextProps.timer.title,
        project: nextProps.timer.project,
        error: true
      })
    }
  },

  handleFormOpen: function() {
    this.setState({isOpen: true});
  },

  handleFormClose: function() {
    this.setState({isOpen: false});
  },

  handleFormSubmit: function(timer) {
    this.props.onFormSubmit(timer);
    this.setState({isOpen: this.props.isOpen});
  },

  render: function() {
    if (this.state.isOpen) {
      return (
        <TimerForm
          title={this.state.title}
          project={this.state.project}
          error={this.state.error}
          onFormClose={this.handleFormClose}
          onFormSubmit={this.handleFormSubmit} />
      );
    } else {
      return (
        <div className="ui basic content center aligned segment">
          <button
            className="ui basic button icon"
            onClick={this.handleFormOpen} >
            <i className="plus icon"></i>
          </button>
        </div>
      );
    }
  }
});

const Timer = React.createClass({
  getInitialState: function() {
    return {
      hovered: false
    };
  },

  handleDeleteClick: function() {
    this.props.onDeleteClick(this.props.id);
  },

  componentDidMount: function() {
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
  },

  componentWillMount: function() {
    clearInterval(this.forceUpdateInterval);
  },

  componentWillUnmount: function() {
    clearInterval(this.forceUpdateInterval);
  },

  handleStartClick: function() {
    this.props.onStartClick(this.props.id);
  },

  handleStopClick: function() {
    this.props.onStopClick(this.props.id);
  },

  handleMouseEnter: function() {
    this.setState({hovered: true});
  },

  handleMouseLeave: function() {
    this.setState({hovered: false});
  },

  render: function() {
    const elapsedString = helpers.renderElapsedString(this.props.elapsed, this.props.runningSince);
    return (
      <div className="ui centered card" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <div className="content" style={{position: 'relative', marginBottom: 10}}>
          <div className="header">
            {this.props.title}
          </div>
          <div className="meta">
            {this.props.project}
          </div>
          <div className="center aligned description">
            <h2>
              {elapsedString}
            </h2>
          </div>
          {this.state.hovered &&
            <div className="extra content" style={{position: 'absolute', bottom: 0, right: 10}}>
              <span
                className="right floated edit icon"
                onClick={this.props.onEditClick}
                style={{cursor: 'pointer'}} >
                <i className="edit icon"></i>
              </span>
              <span
                className="right floated thrash icon"
                onClick={this.handleDeleteClick}
                style={{cursor: 'pointer'}} >
                <i className="trash icon"></i>
              </span>
            </div>
          }
        </div>
        <TimerActionButton
          timerIsRunning={!!this.props.runningSince}
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopClick} />
      </div>
    );
  }
});

const TimerActionButton = React.createClass({
  render: function() {
    if(this.props.timerIsRunning) {
      return (
        <button
          className="ui bottom attached red basic button"
          onClick={this.props.onStopClick} >
          Stop
        </button>
      );
    } else {
      return (
        <button
          className="ui bottom attached red basic button"
          onClick={this.props.onStartClick} >
          Start
        </button>
      )
    }
  }
})

ReactDOM.render(
  <TimersDashboard />,
  document.getElementById('content')
);
