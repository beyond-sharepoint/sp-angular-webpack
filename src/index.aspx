<!doctype html>
<html ng-app="app" lang="en">

<head>
    <meta charset="UTF-8">
    <title>SP Angular Webpack</title>
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/">
    <style>
        .ng-hide {
            display: none!important;
        }
        
        #loading-progress {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        #loading-progress-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        #loading-logo {
            width: 256px;
            height: 256px;
        }
        
        #loading-logo img {
            width: 100%;
            height: 100%;
        }
        
        #loading-progress-bar {
            width: 512px;
            margin-top: 112px;
        }
        
        #progressContainer {
            border-radius: 2px;
            height: 4px;
            background: #f5f5f5;
        }
        
        #primaryProgress {
            background: #ff5722;
            border-radius: 2px;
            height: 4px;
            width: 0%;
            max-width: 100%;
            animation: progress 2.5s 1 forwards;
        }
        
        @keyframes progress {
            from {}
            to {
                width: 100%
            }
        }
        
        #loading-progress-message {
            font-family: initial;
            font-size: 16px;
            line-height: initial;
            color: #9e9e9e;
            margin-top: 56px;
        }
    </style>
</head>

<body>
    <div data-ng-cloak="" data-ng-if="!__applicationIsLoaded">
        <div id="loading-progress">
            <div id="loading-progress-content">
                <div id="loading-logo">
                    <img src="/images/logo.png"></img>
                </div>
                <div id="loading-progress-bar" role="progressbar">
                    <div id="progressContainer">
                        <div id="primaryProgress"></div>
                    </div>
                </div>
                <div id="loading-progress-message">Loading Application…</div>
            </div>
        </div>
    </div>
    <div data-ng-if="__applicationIsLoaded">
        <app></app>
    </div>
</body>

</html>