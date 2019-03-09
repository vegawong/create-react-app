# react-scripts

This package includes scripts and configuration used by [Create React App](https://github.com/facebook/create-react-app).<br>
Please refer to its documentation:

- [Getting Started](https://facebook.github.io/create-react-app/docs/getting-started) – How to create a new app.
- [User Guide](https://facebook.github.io/create-react-app/) – How to develop apps bootstrapped with Create React App.


## Usage

```bash
$ create-react-app <project-name> --scripts-version=@vegawong/react-scripts [options]
```

## Features

- support `husky` + `lint-staged` for code pretty before git commit

- integrate `mobx` & `react-route`

- customize the files skeleton

    - `src/containers/shared/`: for common used container components

    - `src/containers/views/`: for pages containers components that almost correspondings to the routes

    - `src/components/`: for presentational components, it should not had any state and logic

    - `src/assets/{type}`: for static file group by file type

    - `src/services`: almost has some features for api services

    - `src/utils`: utils files

    - `src/stores`: mobx store modules 
