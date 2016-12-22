const TimersDashboard = React.createClass({
  getInitialState: function() {
    return {
      timers: [
        {
          title: 'Practice squat',
          project: 'Gym chores',
          id: uuid.v4(),
          elapsed: 5456099,
          runningSince: Date.now()
        },
        {
          title: 'Bake squash',
          project: 'Kitchen chores',
          id: uuid.v4(),
          elapsed: 1273998,
          runningSince: null
        }
      ]
    };
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

  createTimer: function(timer) {
    const t = helpers.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(t)
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
  },

  deleteTimer: function(id) {
    this.setState({
      timers: this.state.timers.filter(timer => timer.id !== id)
    });
  },

  render: function() {
    return (
      <div className="ui three column centered grid">
        <div className="column">
          <EditableTimerList
            timers={this.state.timers}
            onFormSubmit={this.handleEditFormSubmit}
            onDeleteClick={this.handleDelete} />
          <ToggleableTimerForm onFormSubmit={this.handleCreateFormSubmit} isOpen={true} />
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
          onDeleteClick={this.props.onDeleteClick} />
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
          onDeleteClick={this.props.onDeleteClick} />
      );
    }
  }
});

const TimerForm = React.createClass({
  handleSubmit: function() {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.refs.title.value,
      project: this.refs.project.value
    });
  },

  render: function() {
    const submitText = this.props.id ? 'Update' : 'Create';
    return (
      <div className="ui centered card">
        <div className="content">
          <div className="ui form">
            <div className="field">
              <label>Title</label>
              <input type="text" ref="title" defaultValue={this.props.title} />
            </div>
            <div className="field">
              <label>Project</label>
              <input type="text" ref="project" defaultValue={this.props.project} />
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
      isOpen: false
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
    this.setState({isOpen: false});
  },

  render: function() {
    if (this.state.isOpen) {
      return (
        <TimerForm
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
  handleDeleteClick: function() {
    this.props.onDeleteClick(this.props.id);
  },

  render: function() {
    const elapsedString = helpers.renderElapsedString(this.props.elapsed);
    return (
      <div className="ui centered card">
        <div className="content">
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
          <div className="extra content">
            <span
              className="right floated edit icon"
              onClick={this.props.onEditClick} >
              <i className="edit icon"></i>
            </span>
            <span
              className="right floated thrash icon"
              onClick={this.handleDeleteClick} >
              <i className="trash icon"></i>
            </span>
          </div>
        </div>
        <div className="ui bottom attached blue basic button">
          Start
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <TimersDashboard />,
  document.getElementById('content')
);
