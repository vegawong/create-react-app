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

- support use `baseUrl` as `src` when you import relative modules, such as 

  ```
  import App from 'container/shared/App'
  // but you don't need to write `from '../../../containers...`
  ```

  it was supported in ts modules solutions & webpack
  
- customize the files skeleton

    - `src/containers/shared/`: for common used container components

    - `src/containers/views/`: for pages containers components that almost correspondings to the routes

    - `src/components/`: for presentational components, it should not had any state and logic

    - `src/assets/{type}`: for static file group by file type

    - `src/services`: almost has some features for api services

    - `src/utils`: utils files

    - `src/stores`: mobx store modules 


## ChangeLog

### 3.0.0(2019.5.4) 

- sync v3.0.0 from the `react-scripts`

   - use `@typescript-eslint` instead of `tslint`

   - support lint the react-hooks with `eslint`


- something changed to `httpRequest.js` to catch the error more freedom

