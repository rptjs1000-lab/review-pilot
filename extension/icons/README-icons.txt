ReviewPilot Extension 아이콘
============================

현재 SVG 아이콘을 사용 중입니다.
Chrome Extension Manifest V3에서는 action.default_icon에 SVG가 지원되지 않을 수 있습니다.

프로덕션 배포 전 조치 사항:
1. icon16.svg, icon48.svg, icon128.svg를 각각 PNG 형식으로 변환
2. manifest.json의 아이콘 경로를 .png로 변경
3. 변환 도구 예시: Inkscape, ImageMagick, 또는 온라인 SVG→PNG 변환기

개발 모드에서는 SVG도 동작하므로 현재 상태로 테스트 가능합니다.
