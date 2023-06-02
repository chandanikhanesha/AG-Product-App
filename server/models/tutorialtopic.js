'use strict';
module.exports = (sequelize, DataTypes) => {
  const TutorialTopic = sequelize.define(
    'TutorialTopic',
    {
      topicName: DataTypes.STRING,
      topicOrder: DataTypes.INTEGER,
      subTopicName: DataTypes.STRING,
      subTopicOrder: DataTypes.INTEGER,
      pageHeader: DataTypes.STRING,
      textContent: DataTypes.STRING,
      videoLink: DataTypes.STRING,
      images: DataTypes.JSON,
    },
    {},
  );
  TutorialTopic.associate = function (models) {
    // associations can be defined here
  };
  return TutorialTopic;
};
