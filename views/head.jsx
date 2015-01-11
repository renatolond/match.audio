'use strict';

var React = require('react');

module.exports = React.createClass({

  render: function() {
    var image = this.props.shares ? this.props.shares[0].artwork.large : "https://match.audio/images/logo-512.png";
    var title = this.props.shares ? this.props.shares[0].artist.name + " by " + this.props.shares[0].name : "Match Audio";
    return (
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>Match Audio</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FE4365" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@MatchAudio" />
        <meta name="twitter:title" property="og:title" content={title} />
        <meta name="twitter:description" property="og:description" content="We've matched this music on Rdio, Spotify, Deezer, Beats Music, Google Music and iTunes so you can open it in the service you use." />
        <meta name="twitter:image:src" property="og:image" content={image} />
        <meta property="og:url" content="" />
        <link rel="shortcut icon" href="/images/favicon.png" />
        <link rel="icon" sizes="512x512" href="/images/logo-512.png" />
        <link href='//fonts.googleapis.com/css?family=Open+Sans:400,300,700' rel='stylesheet' type='text/css' />
        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/stylesheets/style.css" />
      </head>
    );
  }
});