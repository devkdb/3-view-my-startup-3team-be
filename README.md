# 풀스택 3기 3팀

팀 협업 문서 : [View My Startup](https://quiet-echinodon-ff0.notion.site/137ec7302e4c80a8a0d3e5b0cef2a86e?v=137ec7302e4c8175be87000c74baf92d)

## 팀원 구성

김두봉 ([개인 Github 링크](https://github.com/devkdb))

김혁진 ([개인 Github 링크](https://github.com/whiteuni))

배진한([개인 Github 링크](https://github.com/Jin-coding-333))

임예지([개인 Github 링크](https://github.com/Bluemoon105))

최종훈([개인 Github 링크](https://github.com/jonghun4))
## 프로젝트 소개

- 스타트업 정보 확인 및 모의 투자 서비스
  > 최근에는 벤처 캐피탈에 비해 개인 투자자들의 스타트업에 대한 관심이 증가하고 있습니다.
  > 하지만 스타트업에 관한 정보 접근성에는 여전히 큰 격차가 존재합니다. 이러한 상황을
  > 개선하기 위해, 개인 투자자들이 스타트업을 선택하여 그들의 누적 투자 금액, 매출액 등을
  > 확인하고 비교할 수 있는 모의 투자 서비스를 제작합니다.


### 프로젝트 기간: 2024.11.07 ~ 2024.11.27

### 기술 스택

- Frontend: HTML, JavaScript, React.js, CSS (module.css)
- Backend: Express.js, PrismaORM
- Database: PostgreSQL
- 공통 Tool: Git & Github, Discord, Zoom

## 팀원별 구현 기능 상세

### 김두봉

 구현 기능 설명
 - Backend Repo 구성
 - 비교 기업 선택하기 API(횟수 업데이트)
 - 선택기업 투자자 정보 GET API
 - 투자자 삭제 시 암호 비교 기능

### 김혁진

 구현 기능 설명
 - 전체 기업 검색기능 확장
 - CORS 에러 해결
 - 라우팅 우선순위를 조정
  (고정 경로가 동적 경로보다 먼저 매칭되도록 하여 404에러 해결)
 
### 배진한

 구현 기능 설명
 - 전체 기업 목록 조회
 - 특정 기업 상세 조회
 - 근접한 순위 기업 정보 확인
 - 기업 선택 횟수 조회
 - 전체 투자 현황 조회
 - Async 핸들러 함수, orderBy 함수, Pagination 함수

### 임예지

 구현 기능 설명
 - 스키마 설계
 - 투자 정보 API(투자 수정, 삭제, 조회, 생성)
 - 특정 기업 상세 조회
 - 전체 기업 검색 기능

### 최종훈

 구현 기능 설명
 - 내 기업과 비교 대상 기업들 비교하기
 - order By Function에서 내용 추가
 - 스키마에서 Startup count -> Startup selctCount로 변경 

# API
### Startup
- GET /api/startups 전체 기업 목록 조회
- GET /api/startups/search 전체 기업 검색 기능
- GET /api/startups/comparition 내 기업과 비교 대상 기업을 비교하기
- GET /api/startups/{startupid} 특정 기업 상세 조회
- GET /api/startups/{startupid}/rank 내 기업의 순위와 근접한 기업 정보 확인
- PATCH /api/startups/selections 비교 기업 선택하기

### Selections
 - GET /api/selections 기업 선택 횟수 조회

### Investors
 - GET /api/investors 내가 선택한 기업의 투자자 정보 얻어오기

### Investments
 - GET /api/investments 전체 투자 현황 조회
 - GET /api/investments 특정 기업에 투자하기
 - PATCH /api/investments/{investmentID} 투자 수정
 - DELETE /api/investments/{investmentID} 투자 삭제

# 파일구조 (BackEnd)

```
3-view-my-startup-3team-be
├─ .gitignore
├─ app.js
├─ asyncHandlerFunction.js
├─ orderByFunction.js
├─ package-lock.json
├─ package.json
├─ paginationHandler.js
├─ prisma
│  ├─ migrations
│  ├─ mocks
│  │  ├─ investors.js
│  │  └─ startups.js
│  ├─ schema.prisma
│  └─ seed.js
├─ README.md
├─ structs.js
└─ test.http

```

## 구현 홈페이지
### https://three-view-my-startup-3team-be.onrender.com
