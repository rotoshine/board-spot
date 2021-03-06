import React, {PropTypes} from 'react';
import moment from 'moment';

export default class Comment extends React.Component {
  static propTypes = {
    comment: PropTypes.object
  };

  render() {
    moment.locale('ko');
    const {comment} = this.props;
    const {createdBy} = comment;

    if(createdBy === null){
      return null;
    }
    return (
      <div className="row">
        <div className="col-xs-3">
          <span className="label label-info">
            <i className={`fa fa-${comment.createdBy.provider}`}/> {comment.createdBy.name}
          </span>
        </div>
        <div className="col-xs-6">
          {comment.content}
        </div>
        <div className="col-xs-2">
          {moment(comment.createdAt).fromNow()}
        </div>
        <div className="col-xs-1">

        </div>
      </div>
    )
  }
}
