# 🏫 ASSIST JS
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![JSR Version](https://img.shields.io/jsr/v/%40lehuyh/assist-js)

An unofficial JavaScript library for fetching class articulation agreements between schools from ASSIST.org

## Quick Start
```typescript
import { fetchAgreementsByMajor } from '@lehuyh/assist-js';

const agreements = await fetchAgreementsByMajor({
    year: 2024,
    fromSchoolID: 18, // Las Positas College
    toSchoolID: 21 // CSU East Bay
})

//Print out agreements grouped by major
console.log(majors)
```

## Installation
Assist JS supports all major package managers vis JSR.

### NPM
```bash
npx jsr add @lehuyh/assist-js
```

### Yarn
```bash
yarn dlx jsr add @lehuyh/assist-js
```

### Deno
```bash
npx jsr add @lehuyh/assist-js
```

To view all available package managers and installation instructions, visit the [JSR package page](https://jsr.io/@lehuyh/assist-js).


## API Reference

### `fetchAllAgreements(options)`

Fetch ALL class articulation agreements between two schools

```typescript
  fetchAllAgreements({ year, fromSchoolID, toSchoolID })
```

| Parameter     | Type     | Description                       |
| :------------ | :------- | :-------------------------------- |
| `year`        | `number` | **Required**. The year of the agreements |
| `fromSchoolID`| `string` | **Required**. The ID of the school from which the agreements are made |
| `toSchoolID`  | `string` | **Required**. The ID of the school to which the agreements are made |

### `fetchAgreementsByMajor(options)`

Fetch class articulation agreements between two schools grouped by major

```typescript
  fetchAgreementsByMajor({ year, fromSchoolID, toSchoolID })
```

| Parameter     | Type     | Description                       |
| :------------ | :------- | :-------------------------------- |
| `year`        | `number` | **Required**. The year of the agreements |
| `fromSchoolID`| `string` | **Required**. The ID of the school from which the agreements are made |
| `toSchoolID`  | `string` | **Required**. The ID of the school to which the agreements are made |


## Utility API Reference

These functions are used internally by the main functions but are exposed if you want to create your own custom functions.

### `createAssistArticulationURL(options)`

For use with `fetchAssistArticulationURL(url)`

```typescript
  createAssistArticulationURL({ year, fromSchoolID, toSchoolID })
```

| Parameter     | Type     | Description                       |
| :------------ | :------- | :-------------------------------- |
| `year`        | `number` | **Required**. The year of the articulation |
| `fromSchoolID`| `string` | **Required**. The ID of the school from which the articulation is made |
| `toSchoolID`  | `string` | **Required**. The ID of the school to which the articulation is made |

### `createAssistArticulationURLFromKey(key)`

For use with `fetchAssistArticulationURL(url)`

```typescript
  createAssistArticulationURLFromKey(key: string)
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `key`     | `string` | **Required**. Key to create URL from |

### `fetchAssistArticulationURL(url)`

Fetches and organizes data from ASSIST.org agreements API

```typescript
  fetchAssistArticulationURL(url: string)
```


| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `url`     | `string` | **Required**. URL to fetch data from |

### `fetchMajors(options)`

Fetches the major agreements between two schools. This only returns major information NOT class articulation agreements.

```typescript
  fetchMajors({ year, fromSchoolID, toSchoolID })
```

| Parameter     | Type     | Description                       |
| :------------ | :------- | :-------------------------------- |
| `year`        | `number` | **Required**. The year of the major agreements |
| `fromSchoolID`| `string` | **Required**. The Assist ID of the school from which the major agreements are being fetched |
| `toSchoolID`  | `string` | **Required**. The Assist ID of the school to which the major agreements are being fetched |


## Author

- [@LehuyH](https://www.github.com/LehuyH)

## License

[MIT](https://choosealicense.com/licenses/mit/)







