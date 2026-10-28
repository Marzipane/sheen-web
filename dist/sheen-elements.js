/*! sheen-web elements | MIT | https://github.com/Marzipane/sheen-web */
(function () {
'use strict';
if (typeof window === 'undefined' || window.sheenElements) return;
var GLYPHS = {"arrow-up":"<path d=\"M12 19V5.5\"></path><path d=\"m6 11 6-6 6 6\"></path>","back":"<path d=\"M14.5 5.5 8 12l6.5 6.5\"></path>","bed":"<path d=\"M3 18V7\"></path><path d=\"M3 14h18v4\"></path><path d=\"M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5\"></path><circle cx=\"7\" cy=\"11\" r=\"1.6\"></circle>","bell":"<path d=\"M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15Z\"></path><path d=\"M10 20.5h4\"></path>","calendar-plus":"<rect x=\"4\" y=\"5.5\" width=\"16\" height=\"14\" rx=\"1.5\"></rect><path d=\"M4 10h16\"></path><path d=\"M8.5 3.5v4\"></path><path d=\"M15.5 3.5v4\"></path><path d=\"M12 12.5v5\"></path><path d=\"M9.5 15h5\"></path>","calendar":"<rect x=\"4\" y=\"5.5\" width=\"16\" height=\"14\" rx=\"1.5\"></rect><path d=\"M4 10h16\"></path><path d=\"M8.5 3.5v4\"></path><path d=\"M15.5 3.5v4\"></path>","car":"<path d=\"M5 16.5V12l2-5h10l2 5v4.5\"></path><path d=\"M3.5 12h17v4.5h-17Z\"></path><circle cx=\"7.5\" cy=\"14.3\" r=\".8\"></circle><circle cx=\"16.5\" cy=\"14.3\" r=\".8\"></circle><path d=\"M6 16.5v2\"></path><path d=\"M18 16.5v2\"></path>","card":"<rect x=\"3\" y=\"5.5\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M3 9.5h18\"></path><path d=\"M6.5 15h4\"></path>","chat":"<path d=\"M4 5.5h16v10H9.5L5 19.5v-4H4Z\"></path><path d=\"M8.5 10.5h7\"></path>","check":"<path d=\"m5 12.5 4.5 4.5L19 7.5\"></path>","chevron-down":"<path d=\"m6 9.5 6 6 6-6\"></path>","chevron":"<path d=\"m9.5 5.5 6.5 6.5-6.5 6.5\"></path>","clock":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"M12 7.5V12l3 2\"></path>","close":"<path d=\"m6.5 6.5 11 11\"></path><path d=\"m17.5 6.5-11 11\"></path>","coin":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"M14.5 9.2c-.5-.9-1.4-1.4-2.5-1.4-1.5 0-2.6.8-2.6 2s1.1 1.6 2.6 1.9 2.6.8 2.6 2-1.1 2-2.6 2c-1.1 0-2-.5-2.5-1.4\"></path><path d=\"M12 6.3v1.5\"></path><path d=\"M12 16.2v1.5\"></path>","compass":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"m15.5 8.5-2 5-5 2 2-5Z\"></path>","compose":"<path d=\"M12 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V12\"></path><path d=\"M17.5 3.5a1.8 1.8 0 0 1 2.5 2.5L12.5 13.5 9 14.5l1-3.5Z\"></path>","copy":"<rect x=\"8.5\" y=\"8.5\" width=\"11\" height=\"11\" rx=\"2\"></rect><path d=\"M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2\"></path>","directions":"<path d=\"M12 2.8 21.2 12 12 21.2 2.8 12Z\"></path><path d=\"M9.5 14.5v-2.5a1.5 1.5 0 0 1 1.5-1.5h3.5\"></path><path d=\"m13 8.5 2 2-2 2\"></path>","document":"<path d=\"M6 3.5h8l4 4v13H6Z\"></path><path d=\"M14 3.5v4h4\"></path><path d=\"M9 12.5h6\"></path><path d=\"M9 16h6\"></path>","door":"<path d=\"M5 20.5h14\"></path><path d=\"M7 20.5V4.5h10v16\"></path><circle cx=\"14\" cy=\"12.5\" r=\".9\"></circle>","download":"<path d=\"M12 4.5V15\"></path><path d=\"m7.5 10.5 4.5 4.5 4.5-4.5\"></path><path d=\"M5 19.5h14\"></path>","dumbbell":"<path d=\"M6.5 8v8\"></path><path d=\"M17.5 8v8\"></path><path d=\"M3.5 10v4\"></path><path d=\"M20.5 10v4\"></path><path d=\"M6.5 12h11\"></path>","eye":"<path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>","filter":"<path d=\"M4 6.5h16\"></path><path d=\"M7 12h10\"></path><path d=\"M10 17.5h4\"></path>","flag":"<path d=\"M5 20.5v-16\"></path><path d=\"M5 4.5h11l-2 4 2 4H5\"></path>","globe":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"M3.5 12h17\"></path><path d=\"M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5s1.1-6.1 3.5-8.5Z\"></path>","grid":"<rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.2\"></rect><rect x=\"13\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.2\"></rect><rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.2\"></rect><rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.2\"></rect>","heart":"<path d=\"M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10Z\"></path>","help":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"M9.6 9.5a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2-2.4 3.6\"></path><path d=\"M12 16.8v.3\"></path>","hourglass":"<path d=\"M7 3.5h10\"></path><path d=\"M7 20.5h10\"></path><path d=\"M8 3.5c0 4 4 5 4 8.5 0-3.5 4-4.5 4-8.5\"></path><path d=\"M8 20.5c0-4 4-5 4-8.5 0 3.5 4 4.5 4 8.5\"></path>","id-card":"<rect x=\"3\" y=\"5.5\" width=\"18\" height=\"13\" rx=\"2\"></rect><circle cx=\"8.5\" cy=\"11\" r=\"2\"></circle><path d=\"M5.8 15.5c.6-1.4 1.6-2 2.7-2s2.1.6 2.7 2\"></path><path d=\"M14 10h4\"></path><path d=\"M14 13.5h3\"></path>","image":"<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2.5\"></rect><circle cx=\"9\" cy=\"10\" r=\"1.8\"></circle><path d=\"m4 17.5 5-4.5 4 3.5 2.5-2 4.5 3.5\"></path>","info":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"M12 11v5\"></path><path d=\"M12 7.6v.4\"></path>","key":"<circle cx=\"8\" cy=\"12\" r=\"3.5\"></circle><path d=\"M11.5 12H20.5\"></path><path d=\"M17.5 12v3\"></path><path d=\"M20.5 12v2\"></path>","layers":"<path d=\"m12 4 8.5 4.5L12 13 3.5 8.5Z\"></path><path d=\"m3.5 12.5 8.5 4.5 8.5-4.5\"></path><path d=\"m3.5 16.5 8.5 4.5 8.5-4.5\"></path>","link":"<path d=\"M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1\"></path><path d=\"M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1\"></path>","location":"<path d=\"M20 4 4 11l7 2 2 7Z\"></path>","lock":"<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5\"></path>","mail":"<rect x=\"3.5\" y=\"5.5\" width=\"17\" height=\"13\" rx=\"2\"></rect><path d=\"m4 7 8 6 8-6\"></path>","map":"<path d=\"M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2Z\"></path><path d=\"M9 4.5v13\"></path><path d=\"M15 6.5v13\"></path>","mic":"<rect x=\"9\" y=\"3.5\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5.5 11.5a6.5 6.5 0 0 0 13 0\"></path><path d=\"M12 18v2.5\"></path>","minus":"<path d=\"M5 12h14\"></path>","more":"<circle cx=\"6\" cy=\"12\" r=\"1.1\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.1\"></circle><circle cx=\"18\" cy=\"12\" r=\"1.1\"></circle>","navigate":"<path d=\"m4 11.5 16-7-7 16-2-7Z\"></path>","passport":"<rect x=\"5.5\" y=\"3.5\" width=\"13\" height=\"17\" rx=\"1.5\"></rect><circle cx=\"12\" cy=\"11\" r=\"3.3\"></circle><path d=\"M8.7 11h6.6\"></path><path d=\"M9 16.5h6\"></path>","people":"<circle cx=\"9\" cy=\"9\" r=\"3\"></circle><path d=\"M3.5 18.5c.8-2.8 3-4.3 5.5-4.3s4.7 1.5 5.5 4.3\"></path><circle cx=\"16.5\" cy=\"9.5\" r=\"2.5\"></circle><path d=\"M16 14.3c2.2.1 3.9 1.5 4.5 4.2\"></path>","phone":"<rect x=\"6.5\" y=\"2.5\" width=\"11\" height=\"19\" rx=\"2.5\"/><path d=\"M10.5 18.5h3\"/>","pin":"<path d=\"M12 21s6.5-6.3 6.5-11A6.5 6.5 0 0 0 5.5 10c0 4.7 6.5 11 6.5 11Z\"></path><circle cx=\"12\" cy=\"10\" r=\"2.3\"></circle>","plane":"<path d=\"M10.5 13.5 4 11l1.5-1.5 7 1L17 6c1-1 2.6-1.3 3-.9.4.4.1 2-.9 3l-4.5 4.5 1 7L14 21l-2.5-6.5-3 3V20L7 21l-1-3-3-1 1-1.5h2.5Z\"></path>","plus":"<path d=\"M12 5v14\"></path><path d=\"M5 12h14\"></path>","pool":"<path d=\"M3 17c1.5 0 1.5-1.2 3-1.2s1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2\"></path><path d=\"M8 14V6a2 2 0 0 1 4 0\"></path><path d=\"M14 14V6a2 2 0 0 1 4 0\"></path><path d=\"M8 9h6\"></path>","refresh":"<path d=\"M19.5 12a7.5 7.5 0 1 1-2.2-5.3\"></path><path d=\"M19.5 4.5v4h-4\"></path>","room-service":"<path d=\"M4 17.5h16\"></path><path d=\"M5.5 17.5a6.5 6.5 0 0 1 13 0\"></path><path d=\"M12 9V7.5\"></path><path d=\"M10.5 7.5h3\"></path>","search":"<circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M16 16l4.5 4.5\"></path>","share":"<path d=\"M12 15V4.5\"></path><path d=\"m8 8.5 4-4 4 4\"></path><path d=\"M5.5 12.5v6h13v-6\"></path>","shield":"<path d=\"M12 3.5 19 6v5.5c0 4.3-3 7.8-7 9-4-1.2-7-4.7-7-9V6Z\"></path><path d=\"m9 12 2 2 4-4\"></path>","ship":"<path d=\"M3.5 13h17l-2.2 4.5H5.7Z\"></path><path d=\"M7 13V9.5h10V13\"></path><path d=\"M10.5 9.5v-3h3v3\"></path><path d=\"M3 20.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1\"></path>","sidebar":"<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2.5\"></rect><path d=\"M9.5 4.5v15\"></path>","sign-out":"<path d=\"M14 4.5h4.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H14\"></path><path d=\"M10 16.5 5.5 12 10 7.5\"></path><path d=\"M5.5 12H15\"></path>","sliders":"<path d=\"M4 7h10\"></path><path d=\"M18 7h2\"></path><circle cx=\"16\" cy=\"7\" r=\"2\"></circle><path d=\"M4 17h2\"></path><path d=\"M10 17h10\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle>","spa":"<path d=\"M12 20c-4.5 0-8-2.8-8.5-7 2.8 0 5.6 1.2 8.5 4.2 2.9-3 5.7-4.2 8.5-4.2-.5 4.2-4 7-8.5 7Z\"></path><path d=\"M12 17.2c-1.8-2.4-2.5-5-1.9-8C10.6 7 11.2 5.4 12 4c.8 1.4 1.4 3 1.9 5.2.6 3-.1 5.6-1.9 8Z\"></path>","sparkle":"<path d=\"M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z\"></path><path d=\"M18.5 15.5c.3 1.6 1.1 2.4 2.5 2.7-1.4.3-2.2 1.1-2.5 2.6-.3-1.5-1.1-2.3-2.5-2.6 1.4-.3 2.2-1.1 2.5-2.7Z\"></path>","star":"<path d=\"m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6Z\"></path>","suitcase":"<rect x=\"4\" y=\"7\" width=\"16\" height=\"12\" rx=\"1.5\"></rect><path d=\"M9 7V5h6v2\"></path><path d=\"M4 12h16\"></path>","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2.5v2\"></path><path d=\"M12 19.5v2\"></path><path d=\"M2.5 12h2\"></path><path d=\"M19.5 12h2\"></path><path d=\"m5.3 5.3 1.4 1.4\"></path><path d=\"m17.3 17.3 1.4 1.4\"></path><path d=\"m5.3 18.7 1.4-1.4\"></path><path d=\"m17.3 6.7 1.4-1.4\"></path>","swap":"<path d=\"M7 7h11l-3-3\"></path><path d=\"M17 17H6l3 3\"></path>","tag":"<path d=\"M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0Z\"></path><circle cx=\"8\" cy=\"8\" r=\"1.4\"></circle>","trash":"<path d=\"M4.5 6.5h15\"></path><path d=\"M9.5 6.5V4.5h5v2\"></path><path d=\"M6.5 6.5l1 13h9l1-13\"></path>","user":"<circle cx=\"12\" cy=\"8.5\" r=\"3.5\"></circle><path d=\"M5 19.5c1.2-3.3 4-5 7-5s5.8 1.7 7 5\"></path>","wallet":"<rect x=\"3.5\" y=\"6\" width=\"17\" height=\"13\" rx=\"2.5\"></rect><path d=\"M3.5 10h17\"></path><path d=\"M6 6V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 5v1\"></path>","waves":"<path d=\"M3 9c1.5 0 1.5-1.5 3-1.5S7.5 9 9 9s1.5-1.5 3-1.5S13.5 9 15 9s1.5-1.5 3-1.5S19.5 9 21 9\"></path><path d=\"M3 15c1.5 0 1.5-1.5 3-1.5S7.5 15 9 15s1.5-1.5 3-1.5S13.5 15 15 15s1.5-1.5 3-1.5S19.5 15 21 15\"></path>","wifi":"<path d=\"M3 9a13 13 0 0 1 18 0\"></path><path d=\"M6.2 12.5a8.5 8.5 0 0 1 11.6 0\"></path><path d=\"M9.3 15.8a4 4 0 0 1 5.4 0\"></path><circle cx=\"12\" cy=\"19\" r=\".9\"></circle>","wrench":"<path d=\"M14.5 4a5 5 0 0 0-5.6 6.6L3.8 15.7a1.8 1.8 0 0 0 2.5 2.5l5.1-5.1A5 5 0 0 0 18 7.5l-3 3-2.5-.5-.5-2.5 3-3a5 5 0 0 0-.5-.5Z\"></path>","x-circle":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>","bolt":"<path d=\"M13 3 5 13.5h6L10.5 21 19 10.5h-6L13 3Z\"/>","captions":"<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"3\"/><path d=\"M10.5 10.3a2.2 2.2 0 1 0 0 3.4M17 10.3a2.2 2.2 0 1 0 0 3.4\"/>","command":"<path d=\"M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9Zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15Zm0 0v6m0 0h-6m6 0v2.5a2.5 2.5 0 1 0 2.5-2.5H15Zm-6 0v2.5A2.5 2.5 0 1 1 6.5 15H9Z\"/>","compare":"<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2.5\"/><path d=\"M12 2.5v19\"/><path d=\"m8.5 10.5-2 1.5 2 1.5M15.5 10.5l2 1.5-2 1.5\"/>","export":"<path d=\"M12 4.5v11M7.5 11 12 15.5 16.5 11\"/><path d=\"M4.5 15v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15\"/>","eye-off":"<path d=\"M3.5 3.5l17 17M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4.5 9.2 6-.3.7-1.2 2-2.6 3.3M6.5 7.6C4.6 8.9 3.3 10.8 2.8 12c.7 1.5 4.2 6 9.2 6a9.6 9.6 0 0 0 4.2-1\"/><path d=\"M9.9 9.9a3 3 0 0 0 4.2 4.2\"/>","film":"<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2.5\"/><path d=\"M7.5 4.5v15M16.5 4.5v15M3.5 9.5h4M3.5 14.5h4M16.5 9.5h4M16.5 14.5h4\"/>","folder":"<path d=\"M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z\"/>","gauge":"<path d=\"M4.2 17a8.5 8.5 0 1 1 15.6 0\"/><path d=\"m12 13 3.8-3.8\"/><circle cx=\"12\" cy=\"13\" r=\"1.3\"/>","history":"<path d=\"M4 12a8 8 0 1 0 2.4-5.7L4 8.7\"/><path d=\"M4 4.5v4.2h4.2M12 8v4.5l3 1.8\"/>","home":"<path d=\"M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19Z\"/>","image-frame":"<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2.5\"/><circle cx=\"9\" cy=\"10\" r=\"1.8\"/><path d=\"m4.5 18 5.5-5 3.5 3 2.5-2 4 3.5\"/>","keyboard":"<rect x=\"2.5\" y=\"6\" width=\"19\" height=\"12\" rx=\"2.5\"/><path d=\"M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M8 14.5h8\"/>","list":"<path d=\"M9 6.5h11M9 12h11M9 17.5h11\"/><circle cx=\"4.8\" cy=\"6.5\" r=\".9\"/><circle cx=\"4.8\" cy=\"12\" r=\".9\"/><circle cx=\"4.8\" cy=\"17.5\" r=\".9\"/>","music":"<path d=\"M9 18V6.5l11-2v11\"/><circle cx=\"6.5\" cy=\"18\" r=\"2.5\"/><circle cx=\"17.5\" cy=\"15.5\" r=\"2.5\"/>","mute":"<path d=\"M4.5 9.5h3l4.5-4v13l-4.5-4h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z\"/><path d=\"m16 9.5 5 5M21 9.5l-5 5\"/>","nodes":"<rect x=\"3\" y=\"4\" width=\"6.5\" height=\"5\" rx=\"1.5\"/><rect x=\"14.5\" y=\"15\" width=\"6.5\" height=\"5\" rx=\"1.5\"/><path d=\"M9.5 6.5h3a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2\"/>","palette":"<path d=\"M12 3.5a8.5 8.5 0 0 0 0 17c1.1 0 1.7-.8 1.7-1.6 0-.9-.7-1.3-.7-2.2 0-1 .8-1.7 1.8-1.7H17a3.5 3.5 0 0 0 3.5-3.5c0-4.4-3.8-8-8.5-8Z\"/><circle cx=\"7.8\" cy=\"11\" r=\".9\"/><circle cx=\"10.5\" cy=\"7.5\" r=\".9\"/><circle cx=\"15\" cy=\"8\" r=\".9\"/>","pause":"<rect x=\"6.5\" y=\"5\" width=\"3.6\" height=\"14\" rx=\"1.2\"/><rect x=\"13.9\" y=\"5\" width=\"3.6\" height=\"14\" rx=\"1.2\"/>","play":"<path d=\"M7.5 5.2v13.6c0 .8.9 1.3 1.6.9l10.6-6.8c.6-.4.6-1.3 0-1.7L9.1 4.3c-.7-.4-1.6.1-1.6.9Z\"/>","quote":"<path d=\"M9.5 7.5H6a1.5 1.5 0 0 0-1.5 1.5v3A1.5 1.5 0 0 0 6 13.5h3v1a3 3 0 0 1-3 3M19.5 7.5H16a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h3v1a3 3 0 0 1-3 3\"/>","redo":"<path d=\"m15 14 4.5-4.5L15 5\"/><path d=\"M19.5 9.5h-9a5.5 5.5 0 0 0 0 11H13\"/>","scissors":"<circle cx=\"6.5\" cy=\"7\" r=\"2.6\"/><circle cx=\"6.5\" cy=\"17\" r=\"2.6\"/><path d=\"M8.6 8.6 19 17.5M8.6 15.4 19 6.5\"/>","skip-back":"<path d=\"M18 6.5v11L10 12l8-5.5Z\"/><path d=\"M6.5 6v12\"/>","skip-forward":"<path d=\"M6 6.5v11l8-5.5-8-5.5Z\"/><path d=\"M17.5 6v12\"/>","split":"<path d=\"M12 3.5v17\"/><path d=\"M4 7.5h5v9H4zM15 7.5h5v9h-5z\"/>","stack":"<path d=\"m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z\"/><path d=\"m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5\"/>","sun-moon":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4\"/>","template":"<rect x=\"3.5\" y=\"4\" width=\"17\" height=\"16\" rx=\"2.5\"/><path d=\"M3.5 9h17M9.5 9v11\"/>","text":"<path d=\"M5 6.5V5h14v1.5M12 5v14M9 19h6\"/>","timeline":"<rect x=\"3\" y=\"5\" width=\"11\" height=\"4\" rx=\"1.3\"/><rect x=\"8\" y=\"10.5\" width=\"13\" height=\"4\" rx=\"1.3\"/><rect x=\"3\" y=\"16\" width=\"8\" height=\"3.5\" rx=\"1.3\"/>","undo":"<path d=\"M9 14 4.5 9.5 9 5\"/><path d=\"M4.5 9.5h9a5.5 5.5 0 0 1 0 11H11\"/>","upload":"<path d=\"M12 15.5V4.5M7.5 9 12 4.5 16.5 9\"/><path d=\"M4.5 15v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15\"/>","volume":"<path d=\"M4.5 9.5h3l4.5-4v13l-4.5-4h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z\"/><path d=\"M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a7.8 7.8 0 0 1 0 11\"/>","wand":"<path d=\"m4 20 11-11M13.5 7.5l3 3\"/><path d=\"M18 3.5v3M16.5 5h3M20 9.5v2M19 10.5h2M9.5 3.5v2M8.5 4.5h2\"/>","waveform":"<path d=\"M3.5 12h1.5M7 8.5v7M10.5 5v14M14 8v8M17.5 10v4M20.5 12h0\"/>","zoom-in":"<circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"/><path d=\"m20 20-4.8-4.8M10.5 8v5M8 10.5h5\"/>","zoom-out":"<circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"/><path d=\"m20 20-4.8-4.8M8 10.5h5\"/>"};
// ---- 00-core.js
// Shared helpers for the sheen elements. Every element:
// - draws in the light DOM, so sheen.css styles it and pages can restyle it;
// - takes all of its words from attributes (already translated); it never renders text of its own;
// - mirrors for dir="rtl" (positions use inset-inline-start, keys follow the reading direction);
// - follows light/dark through the sheen tokens and stops motion under prefers-reduced-motion.
var VERSION = '0.3.0';

function define(tag, cls) {
  if (!window.customElements.get(tag)) window.customElements.define(tag, cls);
}

function emit(el, type, detail) {
  return el.dispatchEvent(new CustomEvent(type, { detail: detail, bubbles: true, cancelable: true }));
}

function h(tag, attrs) {
  var e = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
  }
  for (var i = 2; i < arguments.length; i++) {
    var c = arguments[i];
    if (c == null || c === false) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

// A sheen glyph (the Flutter sheen icons plus the media glyphs) as an inline SVG. Decorative unless label is given.
function glyph(name, size, label) {
  var body = GLYPHS[name];
  if (!body) throw new Error('Unknown sheen glyph "' + name + '"');
  var t = document.createElement('template');
  t.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  var svg = t.content.firstChild;
  var s = String(size || 20);
  svg.setAttribute('width', s);
  svg.setAttribute('height', s);
  svg.setAttribute('class', 'sheen-glyph');
  svg.setAttribute('focusable', 'false');
  if (label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); }
  else svg.setAttribute('aria-hidden', 'true');
  return svg;
}

function isRtl(el) {
  var holder = el.closest('[dir]');
  return (holder ? holder.getAttribute('dir') : document.documentElement.getAttribute('dir')) === 'rtl';
}

function reducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

var uidCount = 0;
function uid(prefix) { uidCount += 1; return (prefix || 'sheen') + '-' + uidCount; }

// 75 → "1:15", 3725 → "1:02:05"; tenths with precise=true ("1:15.4").
function fmtTime(sec, precise) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  var whole = Math.floor(sec), hrs = Math.floor(whole / 3600), mins = Math.floor((whole % 3600) / 60), s = whole % 60;
  var out = (hrs ? hrs + ':' + String(mins).padStart(2, '0') : String(mins)) + ':' + String(s).padStart(2, '0');
  if (precise) out += '.' + Math.floor((sec - whole) * 10);
  return out;
}

// "Photo @n of @all" style templates: fill('@n of @all', {n: 2, all: 5}).
function fill(template, values) {
  return String(template || '').replace(/@(\w+)/g, function (m, k) { return values[k] != null ? values[k] : m; });
}

// Arrow keys along the reading direction: +1 forward, -1 back, 0 otherwise.
function arrowStep(e, el) {
  var fwd = isRtl(el) ? 'ArrowLeft' : 'ArrowRight', back = isRtl(el) ? 'ArrowRight' : 'ArrowLeft';
  if (e.key === fwd || e.key === 'ArrowUp') return 1;
  if (e.key === back || e.key === 'ArrowDown') return -1;
  return 0;
}

// The fraction (0..1) of a pointer along an element, from its inline start.
function pointerFraction(e, el) {
  var r = el.getBoundingClientRect();
  if (!r.width) return 0;
  var f = (e.clientX - r.left) / r.width;
  return clamp(isRtl(el) ? 1 - f : f, 0, 1);
}

function cssVar(el, name, fallback) {
  var v = window.getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

// ---- 10-basics.js
// <sheen-glyph name="play" size="20" label="Play">
//   A sheen glyph. Without label it is decorative (aria-hidden); with label it is an image with that name.
class SheenGlyph extends HTMLElement {
  static get observedAttributes() { return ['name', 'size', 'label']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    var name = this.getAttribute('name');
    if (!name) return;
    this.replaceChildren(glyph(name, this.getAttribute('size') || 20, this.getAttribute('label')));
  }
}
define('sheen-glyph', SheenGlyph);

// <sheen-progress-ring value="0.42" size="56" label="Rendering" show-value indeterminate>
//   A round progress indicator. value is 0..1; without value (or with indeterminate) it spins (it holds still under
//   reduced motion). role=progressbar with aria-valuenow 0..100; label names it for screen readers.
class SheenProgressRing extends HTMLElement {
  static get observedAttributes() { return ['value', 'size', 'label', 'indeterminate', 'show-value']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  get value() { var v = parseFloat(this.getAttribute('value')); return isNaN(v) ? null : clamp(v, 0, 1); }
  set value(v) { this.setAttribute('value', String(v)); }
  render() {
    var size = parseFloat(this.getAttribute('size')) || 48, stroke = Math.max(3, size / 12), r = (size - stroke) / 2;
    var circ = 2 * Math.PI * r, v = this.value, spin = v == null || this.hasAttribute('indeterminate');
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    if (spin) this.removeAttribute('aria-valuenow'); else this.setAttribute('aria-valuenow', String(Math.round(v * 100)));
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.classList.toggle('sheen-spin', spin);
    this.style.setProperty('--sheen-ring-size', size + 'px');
    var dash = spin ? circ * 0.28 : circ * v;
    this.innerHTML = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<circle class="sheen-ring-track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-width="' + stroke + '"/>' +
      '<circle class="sheen-ring-value" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-width="' + stroke +
      '" stroke-dasharray="' + dash + ' ' + circ + '"/></svg>';
    if (this.hasAttribute('show-value') && !spin) {
      this.appendChild(h('span', { class: 'sheen-ring-text sheen-num', 'aria-hidden': 'true', text: Math.round(v * 100) + '%' }));
    }
  }
}
define('sheen-progress-ring', SheenProgressRing);

// <sheen-drop-zone accept="video/*,.mkv" multiple label="Drop a video here" hint="or press Enter to choose a file">
//   A large target for dropping files or choosing them (Enter, Space or a click opens the file chooser). Fires
//   "sheen-files" with detail.files (an array of File). Children are kept and shown under the words.
class SheenDropZone extends HTMLElement {
  connectedCallback() {
    if (this.input) return;
    var self = this;
    this.input = h('input', { type: 'file', class: 'sheen-visually-hidden', tabindex: '-1', 'aria-hidden': 'true' });
    if (this.getAttribute('accept')) this.input.setAttribute('accept', this.getAttribute('accept'));
    if (this.hasAttribute('multiple')) this.input.multiple = true;
    this.input.addEventListener('change', function () { self.take(self.input.files); self.input.value = ''; });
    var extra = Array.prototype.slice.call(this.childNodes);
    var face = h('div', { class: 'sheen-drop-face' },
      glyph(this.getAttribute('glyph') || 'upload', 30),
      h('span', { class: 'sheen-drop-label', text: this.getAttribute('label') || '' }),
      this.getAttribute('hint') ? h('span', { class: 'sheen-drop-hint', text: this.getAttribute('hint') }) : null);
    extra.forEach(function (n) { face.appendChild(n); });
    this.replaceChildren(face, this.input);
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', this.getAttribute('tabindex') || '0');
    this.setAttribute('aria-label', [this.getAttribute('label'), this.getAttribute('hint')].filter(Boolean).join(', '));
    this.addEventListener('click', function (e) { if (e.target !== self.input && !self.hasAttribute('disabled')) self.input.click(); });
    this.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !self.hasAttribute('disabled')) { e.preventDefault(); self.input.click(); }
    });
    this.addEventListener('dragover', function (e) { e.preventDefault(); self.classList.add('sheen-over'); });
    this.addEventListener('dragleave', function () { self.classList.remove('sheen-over'); });
    this.addEventListener('drop', function (e) {
      e.preventDefault();
      self.classList.remove('sheen-over');
      if (!self.hasAttribute('disabled') && e.dataTransfer) self.take(e.dataTransfer.files);
    });
  }
  take(list) {
    var files = Array.prototype.slice.call(list || []);
    if (!this.hasAttribute('multiple')) files = files.slice(0, 1);
    if (files.length) emit(this, 'sheen-files', { files: files });
  }
}
define('sheen-drop-zone', SheenDropZone);

// <sheen-toaster close-label="Dismiss" max="3">  — an aria-live region that queues toasts.
//   toaster.show({title, message, tone: 'info'|'success'|'warning'|'danger', timeout: ms (0 = stays),
//                 action: {label, onClick}}) → id;  toaster.dismiss(id).
//   sheenElements.toast(options) uses the first <sheen-toaster> on the page (and adds one if there is none).
//   Pointer over a toast or focus inside it pauses its timer. At most max are shown; the rest wait their turn.
class SheenToaster extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'region');
    this.setAttribute('aria-live', 'polite');
    if (!this.getAttribute('aria-label') && this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.queue = this.queue || [];
  }
  show(opts) {
    opts = opts || {};
    this.queue = this.queue || [];
    var id = uid('toast'), item = { id: id, opts: opts };
    this.queue.push(item);
    this.pump();
    return id;
  }
  pump() {
    var max = parseInt(this.getAttribute('max'), 10) || 3;
    while (this.querySelectorAll('.sheen-toast').length < max && this.queue.length) this.mount(this.queue.shift());
  }
  mount(item) {
    var self = this, o = item.opts, tone = o.tone || 'info';
    var node = h('div', { class: 'sheen-toast sheen-glass sheen-toast-' + tone, id: item.id, role: tone === 'danger' ? 'alert' : 'status' },
      h('span', { class: 'sheen-toast-dot', 'aria-hidden': 'true' }),
      h('div', { class: 'sheen-toast-text' },
        o.title ? h('b', { text: o.title }) : null,
        o.message ? h('span', { class: 'sheen-secondary', text: o.message }) : null),
      o.action ? h('button', { type: 'button', class: 'sheen-button sheen-small', text: o.action.label,
        onclick: function () { try { o.action.onClick(); } finally { self.dismiss(item.id); } } }) : null,
      h('button', { type: 'button', class: 'sheen-icon-button sheen-toast-close', 'aria-label': this.getAttribute('close-label') || '',
        onclick: function () { self.dismiss(item.id); } }, glyph('close', 18)));
    this.appendChild(node);
    var timeout = o.timeout == null ? 5000 : o.timeout;
    if (timeout > 0) {
      var left = timeout, started = Date.now(), timer = null;
      var run = function () { started = Date.now(); timer = setTimeout(function () { self.dismiss(item.id); }, left); };
      var hold = function () { clearTimeout(timer); left -= Date.now() - started; };
      node.addEventListener('pointerenter', hold);
      node.addEventListener('pointerleave', run);
      node.addEventListener('focusin', hold);
      node.addEventListener('focusout', run);
      run();
    }
  }
  dismiss(id) {
    var node = this.querySelector('#' + id);
    this.queue = (this.queue || []).filter(function (q) { return q.id !== id; });
    if (node) node.remove();
    this.pump();
  }
}
define('sheen-toaster', SheenToaster);

// ---- 20-command-palette.js
// <sheen-command-palette label="Command bar" placeholder="Type a command or search…" hotkey
//                        empty="Nothing found" submit-label="Run “@q”">
//   A ⌘K palette in a modal <dialog>: one text box over a grouped list. The list is a listbox the box controls
//   (aria-activedescendant), so ↑ ↓ Home End move, Enter picks, Esc closes; typing filters on label, hint and keywords.
//   palette.items = [{id, group, label, hint, keywords, glyph, disabled, reason}] (reason is shown when disabled).
//   palette.open(text?) / palette.close() / palette.value.
//   With submit-label, a first row runs what was typed as free text ("@q" is the text) and fires "sheen-submit"
//   {text}; picking an item fires "sheen-select" {item, text}. With hotkey, ⌘K / Ctrl+K opens it anywhere.
//   Put extra content (a plan preview, sample prompts) in palette.aside: it is shown under the list.
class SheenCommandPalette extends HTMLElement {
  connectedCallback() {
    if (this.dialog) return;
    var self = this, listId = uid('cmd-list');
    this._items = this._items || [];
    this.active = 0;
    this.input = h('input', { type: 'text', class: 'sheen-cmd-input', role: 'combobox', 'aria-expanded': 'true',
      'aria-controls': listId, 'aria-autocomplete': 'list', autocomplete: 'off', spellcheck: 'false',
      placeholder: this.getAttribute('placeholder') || '', 'aria-label': this.getAttribute('label') || '' });
    this.list = h('div', { class: 'sheen-cmd-list', role: 'listbox', id: listId, 'aria-label': this.getAttribute('label') || '' });
    this.aside = h('div', { class: 'sheen-cmd-aside' });
    this.dialog = h('dialog', { class: 'sheen-cmd sheen-glass', 'aria-label': this.getAttribute('label') || '' },
      h('div', { class: 'sheen-cmd-head' }, glyph('search', 22), this.input,
        h('kbd', { class: 'sheen-kbd', 'aria-hidden': 'true', text: 'esc' })),
      this.list, this.aside);
    this.replaceChildren(this.dialog);
    this.input.addEventListener('input', function () { self.active = 0; self.render(); });
    this.input.addEventListener('keydown', function (e) { self.onKey(e); });
    this.dialog.addEventListener('click', function (e) { if (e.target === self.dialog) self.close(); });
    this.dialog.addEventListener('close', function () { emit(self, 'sheen-close', {}); });
    this.onHotkey = function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); self.dialog.open ? self.close() : self.open(); }
    };
    if (this.hasAttribute('hotkey')) document.addEventListener('keydown', this.onHotkey);
    this.render();
  }
  disconnectedCallback() { document.removeEventListener('keydown', this.onHotkey); }
  get items() { return this._items || []; }
  set items(v) { this._items = Array.isArray(v) ? v : []; if (this.list) this.render(); }
  get value() { return this.input ? this.input.value : ''; }
  set value(v) { if (this.input) { this.input.value = v; this.active = 0; this.render(); } }
  get isOpen() { return !!(this.dialog && this.dialog.open); }
  open(text) {
    if (text != null) this.value = text;
    if (!this.dialog.open) {
      if (typeof this.dialog.showModal === 'function') this.dialog.showModal(); else this.dialog.setAttribute('open', '');
    }
    this.input.focus();
    this.input.select();
    emit(this, 'sheen-open', {});
  }
  close() {
    if (typeof this.dialog.close === 'function' && this.dialog.open) this.dialog.close(); else this.dialog.removeAttribute('open');
  }
  matches() {
    var q = this.value.trim().toLowerCase();
    var words = q ? q.split(/\s+/) : [];
    return this.items.filter(function (it) {
      if (!words.length) return !it.hideUntilTyped;
      var hay = [it.label, it.hint, it.group, (it.keywords || []).join(' ')].join(' ').toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    });
  }
  rows() {
    var rows = [], q = this.value.trim();
    if (q && this.getAttribute('submit-label')) rows.push({ free: true, label: fill(this.getAttribute('submit-label'), { q: q }), glyph: 'sparkle' });
    return rows.concat(this.matches().slice(0, 60));
  }
  render() {
    var self = this, rows = this.rows(), group = null;
    this._rows = rows;
    this.active = clamp(this.active, 0, Math.max(0, rows.length - 1));
    var nodes = [];
    rows.forEach(function (r, i) {
      if (!r.free && r.group && r.group !== group) {
        group = r.group;
        nodes.push(h('div', { class: 'sheen-cmd-group', role: 'presentation', text: r.group }));
      }
      var id = self.list.id + '-' + i;
      var row = h('div', { class: 'sheen-cmd-row' + (r.free ? ' sheen-cmd-free' : ''), role: 'option', id: id,
          'aria-selected': i === self.active ? 'true' : 'false', 'aria-disabled': r.disabled ? 'true' : null },
        r.glyph ? glyph(r.glyph, 20) : h('span', { class: 'sheen-cmd-dot', 'aria-hidden': 'true' }),
        h('span', { class: 'sheen-cmd-label' }, h('span', { text: r.label }),
          r.disabled && r.reason ? h('small', { class: 'sheen-tertiary', text: r.reason })
            : r.hint ? h('small', { class: 'sheen-secondary', text: r.hint }) : null),
        r.shortcut ? h('kbd', { class: 'sheen-kbd', text: r.shortcut }) : null);
      row.addEventListener('pointermove', function () { if (self.active !== i) { self.active = i; self.mark(); } });
      row.addEventListener('click', function () { self.active = i; self.pick(); });
      nodes.push(row);
    });
    if (!rows.length && this.getAttribute('empty')) nodes.push(h('div', { class: 'sheen-cmd-empty sheen-secondary', text: this.getAttribute('empty') }));
    this.list.replaceChildren.apply(this.list, nodes);
    this.mark();
  }
  mark() {
    var opts = this.list.querySelectorAll('[role="option"]'), self = this;
    opts.forEach(function (o, i) { o.setAttribute('aria-selected', i === self.active ? 'true' : 'false'); });
    var cur = opts[this.active];
    if (cur) { this.input.setAttribute('aria-activedescendant', cur.id); if (cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' }); }
    else this.input.removeAttribute('aria-activedescendant');
  }
  onKey(e) {
    var n = (this._rows || []).length;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.active = n ? (this.active + 1) % n : 0; this.mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.active = n ? (this.active - 1 + n) % n : 0; this.mark(); }
    else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); this.active = 0; this.mark(); }
    else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); this.active = Math.max(0, n - 1); this.mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); this.pick(); }
  }
  pick() {
    var r = (this._rows || [])[this.active];
    if (!r || r.disabled) return;
    if (r.free) emit(this, 'sheen-submit', { text: this.value.trim() });
    else emit(this, 'sheen-select', { item: r, text: this.value.trim() });
  }
}
define('sheen-command-palette', SheenCommandPalette);

// ---- 30-media.js
// <sheen-video src="clip.mp4" poster="…" play-label="Play" pause-label="Pause" seek-label="Position"
//              mute-label="Mute" unmute-label="Unmute" keys>
//   A video with sheen controls: play/pause, the time, a scrubber and mute. The scrubber is a slider
//   (aria-valuetext "1:05 of 3:20"): ← → step 5 s along the reading direction, Home/End jump. In/out points
//   (video.inPoint / outPoint, in seconds) shade the kept part, and markers ([{time, label}]) draw ticks.
//   With keys, the element answers the editing keys while it (or something inside it) has focus:
//   Space or K play/pause, J back 5 s, L forward 5 s, I sets in, O sets out.
//   Events: "sheen-time" {time}, "sheen-inout" {in, out}. Methods: play(), pause(), toggle(), seek(t).
class SheenVideo extends HTMLElement {
  static get observedAttributes() { return ['src', 'poster']; }
  connectedCallback() {
    if (this.video) return;
    var self = this;
    this.inPoint = this.inPoint == null ? null : this.inPoint;
    this.outPoint = this.outPoint == null ? null : this.outPoint;
    this._markers = this._markers || [];
    this.video = h('video', { class: 'sheen-video-media', preload: 'metadata', playsinline: '' });
    this.playBtn = h('button', { type: 'button', class: 'sheen-icon-button sheen-video-play', 'aria-label': this.getAttribute('play-label') || '' }, glyph('play', 20));
    this.time = h('span', { class: 'sheen-video-time sheen-num', 'aria-hidden': 'true', text: '0:00 / 0:00' });
    this.range = h('div', { class: 'sheen-video-range' });
    this.fillBar = h('div', { class: 'sheen-video-fill' });
    this.knob = h('div', { class: 'sheen-video-knob' });
    this.ticks = h('div', { class: 'sheen-video-ticks' });
    this.scrub = h('div', { class: 'sheen-video-scrub', role: 'slider', tabindex: '0', 'aria-label': this.getAttribute('seek-label') || '',
      'aria-valuemin': '0', 'aria-valuemax': '0', 'aria-valuenow': '0' },
      h('div', { class: 'sheen-video-rail' }, this.range, this.fillBar, this.ticks), this.knob);
    this.muteBtn = h('button', { type: 'button', class: 'sheen-icon-button sheen-video-mute', 'aria-label': this.getAttribute('mute-label') || '' }, glyph('volume', 20));
    this.bar = h('div', { class: 'sheen-video-bar sheen-glass' }, this.playBtn, this.time, this.scrub, this.muteBtn);
    this.replaceChildren(this.video, this.bar);
    this.sync();
    this.playBtn.addEventListener('click', function () { self.toggle(); });
    this.video.addEventListener('click', function () { self.toggle(); });
    this.muteBtn.addEventListener('click', function () { self.video.muted = !self.video.muted; self.paint(); });
    ['timeupdate', 'loadedmetadata', 'play', 'pause', 'durationchange', 'volumechange'].forEach(function (t) {
      self.video.addEventListener(t, function () {
        if (t === 'timeupdate' && self.outPoint != null && self.video.currentTime >= self.outPoint && !self.video.paused) self.video.pause();
        self.paint();
        if (t === 'timeupdate') emit(self, 'sheen-time', { time: self.video.currentTime });
      });
    });
    var dragging = false;
    var seekAt = function (e) { self.seek(pointerFraction(e, self.scrub) * (self.duration || 0)); };
    this.scrub.addEventListener('pointerdown', function (e) {
      dragging = true;
      if (self.scrub.setPointerCapture) self.scrub.setPointerCapture(e.pointerId);
      seekAt(e);
    });
    this.scrub.addEventListener('pointermove', function (e) { if (dragging) seekAt(e); });
    this.scrub.addEventListener('pointerup', function () { dragging = false; });
    this.scrub.addEventListener('keydown', function (e) {
      var step = arrowStep(e, self.scrub);
      if (step) { e.preventDefault(); self.seek(self.currentTime + step * (e.shiftKey ? 1 : 5)); }
      else if (e.key === 'Home') { e.preventDefault(); self.seek(0); }
      else if (e.key === 'End') { e.preventDefault(); self.seek(self.duration); }
    });
    this.addEventListener('keydown', function (e) { if (self.hasAttribute('keys')) self.onKey(e); });
    this.paint();
  }
  attributeChangedCallback() { if (this.video) this.sync(); }
  sync() {
    if (this.getAttribute('src') && this.video.getAttribute('src') !== this.getAttribute('src')) this.video.setAttribute('src', this.getAttribute('src'));
    if (this.getAttribute('poster')) this.video.setAttribute('poster', this.getAttribute('poster'));
  }
  get currentTime() { return this.video ? this.video.currentTime || 0 : 0; }
  get duration() { return this.video && isFinite(this.video.duration) ? this.video.duration : (parseFloat(this.getAttribute('duration')) || 0); }
  get markers() { return this._markers || []; }
  set markers(v) { this._markers = Array.isArray(v) ? v : []; if (this.video) this.paint(); }
  play() { var p = this.video.play(); if (p && p.catch) p.catch(function () {}); }
  pause() { this.video.pause(); }
  toggle() { if (this.video.paused) this.play(); else this.pause(); }
  seek(t) {
    var d = this.duration;
    try { this.video.currentTime = clamp(t, 0, d || Math.max(0, t)); } catch (e) { /* not loaded yet */ }
    this.paint();
    emit(this, 'sheen-time', { time: this.currentTime });
  }
  setInOut(inPoint, outPoint) {
    this.inPoint = inPoint; this.outPoint = outPoint;
    this.paint();
    emit(this, 'sheen-inout', { in: inPoint, out: outPoint });
  }
  onKey(e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    var k = e.key.toLowerCase();
    if (k === ' ' && e.target === this.scrub) { e.preventDefault(); this.toggle(); return; }
    if (k === ' ' || k === 'k') { if (e.target.tagName === 'BUTTON' && k === ' ') return; e.preventDefault(); this.toggle(); }
    else if (k === 'j') { e.preventDefault(); this.seek(this.currentTime - 5); }
    else if (k === 'l') { e.preventDefault(); this.seek(this.currentTime + 5); }
    else if (k === 'i') { e.preventDefault(); this.setInOut(this.currentTime, this.outPoint); }
    else if (k === 'o') { e.preventDefault(); this.setInOut(this.inPoint, this.currentTime); }
  }
  paint() {
    var d = this.duration, t = this.currentTime, f = d ? t / d : 0, paused = this.video.paused;
    this.playBtn.replaceChildren(glyph(paused ? 'play' : 'pause', 20));
    this.playBtn.setAttribute('aria-label', this.getAttribute(paused ? 'play-label' : 'pause-label') || '');
    this.muteBtn.replaceChildren(glyph(this.video.muted ? 'mute' : 'volume', 20));
    this.muteBtn.setAttribute('aria-label', this.getAttribute(this.video.muted ? 'unmute-label' : 'mute-label') || '');
    this.time.textContent = fmtTime(t) + ' / ' + fmtTime(d);
    this.scrub.setAttribute('aria-valuemax', String(Math.round(d)));
    this.scrub.setAttribute('aria-valuenow', String(Math.round(t)));
    this.scrub.setAttribute('aria-valuetext', fmtTime(t) + ' / ' + fmtTime(d));
    this.fillBar.style.inlineSize = (f * 100) + '%';
    this.knob.style.insetInlineStart = (f * 100) + '%';
    var a = this.inPoint != null && d ? this.inPoint / d : 0, b = this.outPoint != null && d ? this.outPoint / d : 1;
    this.range.hidden = this.inPoint == null && this.outPoint == null;
    this.range.style.insetInlineStart = (a * 100) + '%';
    this.range.style.inlineSize = (Math.max(0, b - a) * 100) + '%';
    this.ticks.replaceChildren.apply(this.ticks, this.markers.filter(function () { return d; }).map(function (m) {
      return h('span', { class: 'sheen-video-tick', title: m.label || null, style: 'inset-inline-start:' + (m.time / d * 100) + '%' });
    }));
    this.classList.toggle('sheen-playing', !paused);
  }
}
define('sheen-video', SheenVideo);

// <sheen-waveform duration="90" label="Audio position" progress="12.5">
//   Audio peaks drawn as bars (waveform.peaks = [0..1, …]); the played part takes the accent. It is a slider:
//   a click, a drag or ← → seeks and fires "sheen-seek" {time}. Mirrors in right-to-left pages.
class SheenWaveform extends HTMLElement {
  static get observedAttributes() { return ['progress', 'duration']; }
  connectedCallback() {
    if (this.canvas) return;
    var self = this;
    this._peaks = this._peaks || [];
    this.canvas = h('canvas', { class: 'sheen-wave-canvas', 'aria-hidden': 'true' });
    this.replaceChildren(this.canvas);
    this.setAttribute('role', 'slider');
    this.setAttribute('tabindex', this.getAttribute('tabindex') || '0');
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    var drag = false;
    var at = function (e) { self.seekTo(pointerFraction(e, self) * self.duration); };
    this.addEventListener('pointerdown', function (e) { drag = true; at(e); });
    this.addEventListener('pointermove', function (e) { if (drag) at(e); });
    this.addEventListener('pointerup', function () { drag = false; });
    this.addEventListener('keydown', function (e) {
      var s = arrowStep(e, self);
      if (s) { e.preventDefault(); self.seekTo(self.progress + s * (e.shiftKey ? 1 : 5)); }
    });
    if (window.ResizeObserver) { this.ro = new ResizeObserver(function () { self.draw(); }); this.ro.observe(this); }
    this.draw();
  }
  disconnectedCallback() { if (this.ro) this.ro.disconnect(); }
  attributeChangedCallback() { if (this.canvas) this.draw(); }
  get peaks() { return this._peaks || []; }
  set peaks(v) { this._peaks = Array.isArray(v) ? v : []; if (this.canvas) this.draw(); }
  get duration() { return parseFloat(this.getAttribute('duration')) || 0; }
  get progress() { return parseFloat(this.getAttribute('progress')) || 0; }
  set progress(v) { this.setAttribute('progress', String(v)); }
  seekTo(t) {
    t = clamp(t, 0, this.duration);
    this.progress = t;
    emit(this, 'sheen-seek', { time: t });
  }
  draw() {
    var d = this.duration, p = this.progress;
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', String(Math.round(d)));
    this.setAttribute('aria-valuenow', String(Math.round(p)));
    this.setAttribute('aria-valuetext', fmtTime(p) + ' / ' + fmtTime(d));
    var ctx = this.canvas.getContext ? this.canvas.getContext('2d') : null;
    if (!ctx) return;
    var w = this.clientWidth || 300, hgt = this.clientHeight || 56, dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(hgt * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hgt);
    var peaks = this.peaks, n = peaks.length;
    if (!n) return;
    var bar = 3, gap = 2, count = Math.max(1, Math.floor(w / (bar + gap))), rtl = isRtl(this);
    var played = cssVar(this, '--sheen-accent', '#1F6FEB'), rest = cssVar(this, '--sheen-text-tertiary', '#868E9D');
    for (var i = 0; i < count; i++) {
      var v = peaks[Math.floor(i / count * n)] || 0, bh = Math.max(2, v * (hgt - 4));
      var x = i * (bar + gap); if (rtl) x = w - x - bar;
      ctx.fillStyle = d && (i / count) <= p / d ? played : rest;
      ctx.fillRect(x, (hgt - bh) / 2, bar, bh);
    }
  }
}
define('sheen-waveform', SheenWaveform);

// <sheen-compare before="in.jpg" after="out.jpg" kind="image|video" label="Compare before and after"
//                before-label="Before" after-label="After" position="50">
//   A split view: the "after" picture over the "before", cut at a handle you drag or move with ← → (a slider).
//   With kind="video" both videos play together (compare.play() / pause(); they stay in sync).
class SheenCompare extends HTMLElement {
  static get observedAttributes() { return ['before', 'after', 'position']; }
  connectedCallback() {
    if (this.handle) return;
    var self = this, video = this.getAttribute('kind') === 'video';
    var media = function (src) {
      return video ? h('video', { src: src, muted: '', playsinline: '', preload: 'metadata', class: 'sheen-compare-media' })
        : h('img', { src: src, alt: '', class: 'sheen-compare-media' });
    };
    this.before = media(this.getAttribute('before'));
    this.after = media(this.getAttribute('after'));
    if (video) { this.before.muted = true; this.after.muted = true; }
    this.afterWrap = h('div', { class: 'sheen-compare-after' }, this.after);
    this.handle = h('div', { class: 'sheen-compare-handle', role: 'slider', tabindex: '0', 'aria-label': this.getAttribute('label') || '',
      'aria-valuemin': '0', 'aria-valuemax': '100' }, h('span', { class: 'sheen-compare-grip sheen-glass' }, glyph('compare', 18)));
    // replaceChildren(null) would insert the text "null": only real nodes go in
    this.replaceChildren.apply(this, [this.before, this.afterWrap, this.handle,
      this.getAttribute('before-label') ? h('span', { class: 'sheen-compare-tag sheen-glass-clear sheen-compare-tag-before', text: this.getAttribute('before-label') }) : null,
      this.getAttribute('after-label') ? h('span', { class: 'sheen-compare-tag sheen-glass-clear sheen-compare-tag-after', text: this.getAttribute('after-label') }) : null].filter(Boolean));
    var drag = false;
    this.addEventListener('pointerdown', function (e) { drag = true; self.position = pointerFraction(e, self) * 100; });
    this.addEventListener('pointermove', function (e) { if (drag) self.position = pointerFraction(e, self) * 100; });
    window.addEventListener('pointerup', function () { drag = false; });
    this.handle.addEventListener('keydown', function (e) {
      var s = arrowStep(e, self.handle);
      if (s) { e.preventDefault(); self.position = self.position + s * (e.shiftKey ? 10 : 2); }
    });
    if (video) {
      this.before.addEventListener('timeupdate', function () {
        if (Math.abs(self.after.currentTime - self.before.currentTime) > 0.15) self.after.currentTime = self.before.currentTime;
      });
    }
    this.paint();
  }
  attributeChangedCallback(name) {
    if (!this.handle) return;
    if (name === 'before') this.before.setAttribute('src', this.getAttribute('before'));
    if (name === 'after') this.after.setAttribute('src', this.getAttribute('after'));
    this.paint();
  }
  get position() { var v = parseFloat(this.getAttribute('position')); return isNaN(v) ? 50 : clamp(v, 0, 100); }
  set position(v) { this.setAttribute('position', String(clamp(v, 0, 100))); emit(this, 'sheen-change', { position: this.position }); }
  play() { [this.before, this.after].forEach(function (m) { if (m.play) { var p = m.play(); if (p && p.catch) p.catch(function () {}); } }); }
  pause() { [this.before, this.after].forEach(function (m) { if (m.pause) m.pause(); }); }
  paint() {
    var p = this.position;
    this.style.setProperty('--sheen-compare', p + '%');
    this.handle.setAttribute('aria-valuenow', String(Math.round(p)));
    this.handle.setAttribute('aria-valuetext', Math.round(p) + '%');
  }
}
define('sheen-compare', SheenCompare);

// ---- 40-editing.js
// <sheen-timeline duration="90" playhead="12" label="Timeline" zoom-in-label="Zoom in" zoom-out-label="Zoom out"
//                 split-label="Split at the playhead">
//   A simple multi-track timeline (not a full editor). timeline.tracks =
//     [{id, label, kind: 'video'|'audio'|'captions'|'overlay', peaks?: [0..1], clips: [{id, start, end, label}]}]
//   Clips sit on lanes by time; the playhead is a line. Click a lane or the ruler to seek ("sheen-seek" {time}).
//   Each clip is a button with trim handles at both ends (drag them). Keyboard on a focused clip:
//     Alt+← → trims its start, Shift+← → trims its end (0.5 s; with Ctrl 0.1 s), S splits it at the playhead,
//     Delete removes it. ← → alone move the playhead by 1 s.
//   Events: "sheen-clipchange" {track, clip}, "sheen-split" {track, clip, time}, "sheen-clipdelete" {track, clip},
//   "sheen-seek" {time}. The element changes its own tracks first, so listeners can save timeline.tracks.
class SheenTimeline extends HTMLElement {
  static get observedAttributes() { return ['playhead', 'duration']; }
  connectedCallback() {
    if (this.scroller) return;
    var self = this;
    this._tracks = this._tracks || [];
    this.zoom = 1;
    var tool = function (g, attr, fn) {
      return h('button', { type: 'button', class: 'sheen-icon-button sheen-small-icon', 'aria-label': self.getAttribute(attr) || '', title: self.getAttribute(attr) || null, onclick: fn }, glyph(g, 18));
    };
    this.toolbar = h('div', { class: 'sheen-tl-tools', role: 'toolbar', 'aria-label': this.getAttribute('label') || '' },
      tool('zoom-out', 'zoom-out-label', function () { self.setZoom(self.zoom / 1.5); }),
      tool('zoom-in', 'zoom-in-label', function () { self.setZoom(self.zoom * 1.5); }),
      tool('split', 'split-label', function () { self.splitAt(self.playhead); }));
    this.canvasWrap = h('div', { class: 'sheen-tl-body' });
    this.scroller = h('div', { class: 'sheen-tl-scroll' }, this.canvasWrap);
    this.replaceChildren(this.toolbar, this.scroller);
    this.setAttribute('role', 'group');
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.scroller.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.sheen-tl-clip')) return;
      var lane = e.target.closest('.sheen-tl-lane, .sheen-tl-ruler');
      if (lane) self.seek(self.timeAt(e, lane));
    });
    if (window.ResizeObserver) { this.ro = new ResizeObserver(function () { self.render(); }); this.ro.observe(this); }
    this.render();
  }
  disconnectedCallback() { if (this.ro) this.ro.disconnect(); }
  attributeChangedCallback(name) { if (!this.scroller) return; if (name === 'playhead') this.paintHead(); else this.render(); }
  get tracks() { return this._tracks || []; }
  set tracks(v) { this._tracks = Array.isArray(v) ? v : []; if (this.scroller) this.render(); }
  get duration() { return parseFloat(this.getAttribute('duration')) || 0; }
  get playhead() { return parseFloat(this.getAttribute('playhead')) || 0; }
  set playhead(v) { this.setAttribute('playhead', String(clamp(v, 0, this.duration))); }
  pps() {
    // at zoom 1 the whole duration fits beside the track names
    var head = parseFloat(cssVar(this, '--sheen-tl-head-size', '96')) || 96, w = (this.scroller.clientWidth || 600) - head - 8;
    return this.duration ? (Math.max(80, w) / this.duration) * this.zoom : 10;
  }
  setZoom(z) { this.zoom = clamp(z, 1, 40); this.render(); emit(this, 'sheen-zoom', { zoom: this.zoom }); }
  timeAt(e, lane) {
    var r = lane.getBoundingClientRect(), x = isRtl(this) ? r.right - e.clientX : e.clientX - r.left;
    return clamp(x / this.pps(), 0, this.duration);
  }
  seek(t) { this.playhead = t; emit(this, 'sheen-seek', { time: this.playhead }); }
  find(clipId) {
    for (var i = 0; i < this.tracks.length; i++) {
      var c = (this.tracks[i].clips || []).filter(function (x) { return x.id === clipId; })[0];
      if (c) return { track: this.tracks[i], clip: c };
    }
    return null;
  }
  splitAt(time, clipId) {
    var self = this, done = false;
    this.tracks.forEach(function (tr) {
      (tr.clips || []).slice().forEach(function (c) {
        if (done || (clipId && c.id !== clipId) || !(time > c.start + 0.05 && time < c.end - 0.05)) return;
        if (!clipId && tr.kind !== 'video') return;
        var right = Object.assign({}, c, { id: c.id + '-' + Math.round(time * 1000), start: time });
        c.end = time;
        tr.clips.splice(tr.clips.indexOf(c) + 1, 0, right);
        done = true;
        self.render();
        emit(self, 'sheen-split', { track: tr, clip: c, time: time });
      });
    });
    return done;
  }
  trim(track, clip, edge, delta) {
    var i = track.clips.indexOf(clip), prev = track.clips[i - 1], next = track.clips[i + 1];
    if (edge === 'start') clip.start = clamp(clip.start + delta, prev ? prev.end : 0, clip.end - 0.2);
    else clip.end = clamp(clip.end + delta, clip.start + 0.2, next ? next.start : this.duration);
  }
  render() {
    var self = this, pps = this.pps(), width = Math.max(1, this.duration * pps);
    var step = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300].filter(function (s) { return s * pps >= 64; })[0] || 600;
    var ruler = h('div', { class: 'sheen-tl-ruler', 'aria-hidden': 'true', style: 'inline-size:' + width + 'px' });
    for (var t = 0; t < this.duration - step * 0.4; t += step) {   // no label hanging over the end
      ruler.appendChild(h('span', { class: 'sheen-tl-mark sheen-num', style: 'inset-inline-start:' + t * pps + 'px', text: fmtTime(t) }));
    }
    var rows = this.tracks.map(function (tr) {
      var lane = h('div', { class: 'sheen-tl-lane sheen-tl-' + (tr.kind || 'video'), style: 'inline-size:' + width + 'px' });
      if (tr.peaks && tr.peaks.length) lane.appendChild(self.peaksCanvas(tr.peaks, width));
      (tr.clips || []).forEach(function (c) { lane.appendChild(self.clipNode(tr, c, pps)); });
      return h('div', { class: 'sheen-tl-track', role: 'group', 'aria-label': tr.label || '' },
        h('div', { class: 'sheen-tl-head', 'aria-hidden': 'true' }, h('span', { class: 'sheen-ellipsis', text: tr.label || '' })), lane);
    });
    this.head = h('div', { class: 'sheen-tl-playhead', 'aria-hidden': 'true' });
    this.canvasWrap.replaceChildren.apply(this.canvasWrap, [h('div', { class: 'sheen-tl-track sheen-tl-ruler-row' },
      h('div', { class: 'sheen-tl-head' }), ruler)].concat(rows, [this.head]));
    this.paintHead();
  }
  paintHead() {
    if (!this.head) return;
    this.head.style.insetInlineStart = 'calc(var(--sheen-tl-head-size) + ' + (this.playhead * this.pps()) + 'px)';
  }
  peaksCanvas(peaks, width) {
    var cv = h('canvas', { class: 'sheen-tl-peaks', 'aria-hidden': 'true' });
    var ctx = cv.getContext ? cv.getContext('2d') : null;
    if (!ctx) return cv;
    var hgt = 40, rtl = isRtl(this);
    cv.width = Math.min(8000, Math.round(width)); cv.height = hgt;
    ctx.fillStyle = cssVar(this, '--sheen-text-tertiary', '#868E9D');
    for (var x = 0; x < cv.width; x += 3) {
      var v = peaks[Math.floor(x / cv.width * peaks.length)] || 0, bh = Math.max(1, v * (hgt - 4));
      ctx.fillRect(rtl ? cv.width - x - 2 : x, (hgt - bh) / 2, 2, bh);
    }
    return cv;
  }
  clipNode(tr, c, pps) {
    var self = this;
    var node = h('button', { type: 'button', class: 'sheen-tl-clip', 'data-clip': c.id,
      'aria-label': (c.label || '') + ' ' + fmtTime(c.start, true) + ' – ' + fmtTime(c.end, true),
      style: 'inset-inline-start:' + c.start * pps + 'px;inline-size:' + Math.max(4, (c.end - c.start) * pps) + 'px' },
      h('span', { class: 'sheen-tl-grip sheen-tl-grip-start', 'data-edge': 'start', 'aria-hidden': 'true' }),
      h('span', { class: 'sheen-tl-clip-label sheen-ellipsis', text: c.label || '' }),
      h('span', { class: 'sheen-tl-grip sheen-tl-grip-end', 'data-edge': 'end', 'aria-hidden': 'true' }));
    node.addEventListener('pointerdown', function (e) {
      var edge = e.target.getAttribute('data-edge');
      if (!edge) return;
      e.preventDefault();
      var x0 = e.clientX, start = c[edge], dir = isRtl(self) ? -1 : 1;
      var move = function (ev) {
        var d = (ev.clientX - x0) * dir / pps;
        self.trim(tr, c, edge, start + d - c[edge]);
        node.style.insetInlineStart = c.start * pps + 'px';
        node.style.inlineSize = Math.max(4, (c.end - c.start) * pps) + 'px';
      };
      var up = function () {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        emit(self, 'sheen-clipchange', { track: tr, clip: c });
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    node.addEventListener('click', function () { emit(self, 'sheen-select', { track: tr, clip: c }); });
    node.addEventListener('keydown', function (e) {
      var s = arrowStep(e, self), amount = e.ctrlKey ? 0.1 : 0.5;
      if (s && (e.altKey || e.shiftKey) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        self.trim(tr, c, e.altKey ? 'start' : 'end', s * amount);
        self.render();
        self.focusClip(c.id);
        emit(self, 'sheen-clipchange', { track: tr, clip: c });
      } else if (s && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        self.seek(self.playhead + s);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (self.splitAt(self.playhead, c.id)) self.focusClip(c.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        tr.clips.splice(tr.clips.indexOf(c), 1);
        self.render();
        emit(self, 'sheen-clipdelete', { track: tr, clip: c });
      }
    });
    return node;
  }
  focusClip(id) { var n = this.querySelector('[data-clip="' + id + '"]'); if (n) n.focus(); }
}
define('sheen-timeline', SheenTimeline);

// <sheen-transcript label="Transcript" current="12.4" removed-label="cut" follow>
//   Text-based editing. transcript.words = [{text, start, end, kind: 'word'|'filler'|'pause', removed}] (a pause
//   token's text is given by the page, e.g. "1.4 s"). It is a multi-select listbox: click a word to jump there
//   ("sheen-seek" {time}), Shift+click or Shift+← → to select a run, Delete or Backspace to cut the selection (or put
//   it back if all of it was cut). Fillers and long pauses are highlighted; transcript.removeKind('filler') cuts all of
//   a kind at once. Every change fires "sheen-edit" {removed: [index…], restored: [index…]} after updating words.
//   The word at the current time is marked; with follow it is kept in view.
class SheenTranscript extends HTMLElement {
  static get observedAttributes() { return ['current']; }
  connectedCallback() {
    if (this.listId) return;
    var self = this;
    this.listId = uid('transcript');
    this._words = this._words || [];
    this.active = 0; this.anchor = 0; this.selected = new Set();
    this.setAttribute('role', 'listbox');
    this.setAttribute('aria-multiselectable', 'true');
    this.setAttribute('tabindex', '0');
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.addEventListener('click', function (e) {
      var w = e.target.closest('[data-i]');
      if (!w) return;
      var i = +w.getAttribute('data-i');
      if (e.shiftKey) self.selectRange(self.anchor, i); else { self.anchor = i; self.selectRange(i, i); emit(self, 'sheen-seek', { time: self.words[i].start }); }
      self.active = i; self.mark();
    });
    this.addEventListener('keydown', function (e) { self.onKey(e); });
    this.render();
  }
  attributeChangedCallback() { if (this.listId) this.paintNow(); }
  get words() { return this._words || []; }
  set words(v) { this._words = Array.isArray(v) ? v : []; if (this.listId) { this.selected = new Set(); this.render(); } }
  selectRange(a, b) {
    this.selected = new Set();
    for (var i = Math.min(a, b); i <= Math.max(a, b); i++) this.selected.add(i);
    this.mark();
  }
  onKey(e) {
    var n = this.words.length, s = arrowStep(e, this);
    if (!n) return;
    if (s && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      this.active = clamp(this.active + s, 0, n - 1);
      if (e.shiftKey) this.selectRange(this.anchor, this.active); else { this.anchor = this.active; this.selectRange(this.active, this.active); }
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      this.active = e.key === 'Home' ? 0 : n - 1;
      if (e.shiftKey) this.selectRange(this.anchor, this.active); else { this.anchor = this.active; this.selectRange(this.active, this.active); }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      emit(this, 'sheen-seek', { time: this.words[this.active].start });
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.toggleCut(this.selected.size ? Array.from(this.selected) : [this.active]);
    }
  }
  toggleCut(indices) {
    var words = this.words, allCut = indices.every(function (i) { return words[i] && words[i].removed; });
    var changed = indices.filter(function (i) { return words[i] && !!words[i].removed === allCut; });
    changed.forEach(function (i) { words[i].removed = !allCut; });
    this.render();
    emit(this, 'sheen-edit', allCut ? { removed: [], restored: changed } : { removed: changed, restored: [] });
    return changed;
  }
  removeKind(kind) {
    var idx = [];
    this.words.forEach(function (w, i) { if (w.kind === kind && !w.removed) idx.push(i); });
    if (!idx.length) return [];
    idx.forEach(function (i) { this.words[i].removed = true; }, this);
    this.render();
    emit(this, 'sheen-edit', { removed: idx, restored: [] });
    return idx;
  }
  render() {
    var self = this, cut = this.getAttribute('removed-label');
    var nodes = this.words.map(function (w, i) {
      var label = w.removed && cut ? w.text + ', ' + cut : null;
      return h('span', { class: 'sheen-word sheen-word-' + (w.kind || 'word') + (w.removed ? ' sheen-removed' : ''),
        role: 'option', id: self.listId + '-' + i, 'data-i': String(i), 'aria-selected': 'false', 'aria-label': label, dir: 'auto',
        title: fmtTime(w.start, true), text: w.text });
    });
    var frag = [];
    nodes.forEach(function (n) { frag.push(n, document.createTextNode(' ')); });
    this.replaceChildren.apply(this, frag);
    this.mark();
    this.paintNow();
  }
  mark() {
    var self = this;
    this.querySelectorAll('[data-i]').forEach(function (n) {
      var i = +n.getAttribute('data-i');
      n.setAttribute('aria-selected', self.selected.has(i) ? 'true' : 'false');
      n.classList.toggle('sheen-active', i === self.active);
    });
    if (this.words.length) this.setAttribute('aria-activedescendant', this.listId + '-' + this.active);
  }
  paintNow() {
    var t = parseFloat(this.getAttribute('current')), now = null;
    if (isNaN(t)) return;
    this.querySelectorAll('.sheen-now').forEach(function (n) { n.classList.remove('sheen-now'); });
    for (var i = 0; i < this.words.length; i++) {
      var w = this.words[i];
      if (t >= w.start && t < w.end) { now = this.querySelector('[data-i="' + i + '"]'); break; }
    }
    if (now) {
      now.classList.add('sheen-now');
      if (this.hasAttribute('follow') && now.scrollIntoView) now.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }
}
define('sheen-transcript', SheenTranscript);

// ---- 50-node-graph.js
// <sheen-node-graph label="Pipeline" connect-label="Connect from @name: choose a node and press Enter"
//                   connected-label="Connected @from to @to" remove-label="Remove">
//   A small node-graph canvas. graph.nodes = [{id, label, sub, glyph, x, y}] (x, y in px from the inline start and the
//   top), graph.edges = [{from, to}]. Drag a node to move it; drag from its out-port (inline end) to another node to
//   connect them. Each node is a button, so the keyboard works too: ← → ↑ ↓ move the focused node (Shift: farther),
//   C starts a connection from it (then Tab to the target and press Enter; Esc cancels), Delete removes it.
//   A focused edge (Tab reaches them after the nodes) is removed with Delete.
//   Every change fires "sheen-graphchange" {nodes, edges}; "sheen-nodeopen" {node} on double-click.
class SheenNodeGraph extends HTMLElement {
  connectedCallback() {
    if (this.svg) return;
    var self = this;
    this._nodes = this._nodes || []; this._edges = this._edges || [];
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'sheen-graph-edges');
    this.layer = h('div', { class: 'sheen-graph-nodes' });
    this.live = h('div', { class: 'sheen-visually-hidden', 'aria-live': 'polite' });
    this.replaceChildren(this.svg, this.layer, this.live);
    this.setAttribute('role', 'group');
    if (this.getAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
    this.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.connecting) { self.connecting = null; self.classList.remove('sheen-connecting'); self.say(''); }
    });
    this.render();
  }
  get nodes() { return this._nodes || []; }
  set nodes(v) { this._nodes = Array.isArray(v) ? v : []; if (this.svg) this.render(); }
  get edges() { return this._edges || []; }
  set edges(v) { this._edges = Array.isArray(v) ? v : []; if (this.svg) this.render(); }
  say(t) { this.live.textContent = t; }
  changed() { emit(this, 'sheen-graphchange', { nodes: this.nodes, edges: this.edges }); }
  node(id) { return this.nodes.filter(function (n) { return n.id === id; })[0]; }
  connect(from, to) {
    if (!from || !to || from === to) return false;
    if (this.edges.some(function (e) { return e.from === from && e.to === to; })) return false;
    // a pipeline node has one way in and one way out: a new edge replaces the old ones at both ends
    this._edges = this.edges.filter(function (e) { return e.from !== from && e.to !== to; });
    this._edges.push({ from: from, to: to });
    this.render();
    this.say(fill(this.getAttribute('connected-label'), { from: this.node(from).label, to: this.node(to).label }));
    this.changed();
    return true;
  }
  remove(id) {
    this._nodes = this.nodes.filter(function (n) { return n.id !== id; });
    this._edges = this.edges.filter(function (e) { return e.from !== id && e.to !== id; });
    this.render();
    this.changed();
  }
  render() {
    var self = this;
    this.layer.replaceChildren.apply(this.layer, this.nodes.map(function (n) { return self.nodeEl(n); }));
    this.drawEdges();
  }
  nodeEl(n) {
    var self = this;
    var el = h('button', { type: 'button', class: 'sheen-graph-node sheen-glass', 'data-node': n.id,
        style: 'inset-inline-start:' + (n.x || 0) + 'px;inset-block-start:' + (n.y || 0) + 'px' },
      h('span', { class: 'sheen-graph-port sheen-graph-in', 'aria-hidden': 'true' }),
      n.glyph ? glyph(n.glyph, 20) : null,
      h('span', { class: 'sheen-graph-text' }, h('b', { class: 'sheen-ellipsis', text: n.label || '' }),
        n.sub ? h('small', { class: 'sheen-secondary sheen-ellipsis', text: n.sub }) : null),
      h('span', { class: 'sheen-graph-port sheen-graph-out', 'data-port': 'out', 'aria-hidden': 'true' }));
    el.addEventListener('dblclick', function () { emit(self, 'sheen-nodeopen', { node: n }); });
    el.addEventListener('pointerdown', function (e) {
      var port = e.target.getAttribute('data-port') === 'out', x0 = e.clientX, y0 = e.clientY, nx = n.x || 0, ny = n.y || 0;
      var dir = isRtl(self) ? -1 : 1, moved = false, ghost = null;
      e.preventDefault();
      el.focus();
      var move = function (ev) {
        moved = true;
        if (port) {
          if (!ghost) { ghost = document.createElementNS('http://www.w3.org/2000/svg', 'path'); ghost.setAttribute('class', 'sheen-graph-ghost'); self.svg.appendChild(ghost); }
          var r = self.getBoundingClientRect(), a = self.portPoint(n, 'out');
          var bx = isRtl(self) ? r.right - ev.clientX : ev.clientX - r.left;
          ghost.setAttribute('d', self.curve(a.x, a.y, bx, ev.clientY - r.top));
        } else {
          n.x = Math.max(0, nx + (ev.clientX - x0) * dir); n.y = Math.max(0, ny + ev.clientY - y0);
          el.style.insetInlineStart = n.x + 'px'; el.style.insetBlockStart = n.y + 'px';
          self.drawEdges();
        }
      };
      var up = function (ev) {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        if (ghost) ghost.remove();
        if (port) {
          var target = document.elementFromPoint ? document.elementFromPoint(ev.clientX, ev.clientY) : null;
          var t = target && target.closest ? target.closest('[data-node]') : null;
          if (t) self.connect(n.id, t.getAttribute('data-node'));
        } else if (moved) self.changed();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    el.addEventListener('keydown', function (e) {
      var big = e.shiftKey ? 40 : 10, dir = isRtl(self) ? -1 : 1, dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -big * dir; else if (e.key === 'ArrowRight') dx = big * dir;
      else if (e.key === 'ArrowUp') dy = -big; else if (e.key === 'ArrowDown') dy = big;
      if (dx || dy) {
        e.preventDefault();
        n.x = Math.max(0, (n.x || 0) + dx); n.y = Math.max(0, (n.y || 0) + dy);
        el.style.insetInlineStart = n.x + 'px'; el.style.insetBlockStart = n.y + 'px';
        self.drawEdges(); self.changed();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        self.connecting = n.id; self.classList.add('sheen-connecting');
        self.say(fill(self.getAttribute('connect-label'), { name: n.label }));
      } else if (e.key === 'Enter' && self.connecting && self.connecting !== n.id) {
        e.preventDefault();
        var from = self.connecting; self.connecting = null; self.classList.remove('sheen-connecting');
        self.connect(from, n.id);
        self.focusNode(n.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        self.remove(n.id);
      }
    });
    return el;
  }
  focusNode(id) { var el = this.querySelector('[data-node="' + id + '"]'); if (el) el.focus(); }
  size(n) {
    var el = this.querySelector('[data-node="' + n.id + '"]');
    return { w: (el && el.offsetWidth) || 180, h: (el && el.offsetHeight) || 56 };
  }
  portPoint(n, which) {
    var s = this.size(n);
    return { x: (n.x || 0) + (which === 'out' ? s.w : 0), y: (n.y || 0) + s.h / 2 };
  }
  curve(ax, ay, bx, by) {
    var c = Math.max(40, Math.abs(bx - ax) / 2);
    return 'M' + ax + ',' + ay + ' C' + (ax + c) + ',' + ay + ' ' + (bx - c) + ',' + by + ' ' + bx + ',' + by;
  }
  drawEdges() {
    var self = this, w = 0, hh = 0;
    this.nodes.forEach(function (n) { var s = self.size(n); w = Math.max(w, (n.x || 0) + s.w + 60); hh = Math.max(hh, (n.y || 0) + s.h + 40); });
    this.svg.setAttribute('width', String(w)); this.svg.setAttribute('height', String(hh));
    this.layer.style.minBlockSize = hh + 'px';
    this.layer.style.minInlineSize = w + 'px';
    var paths = this.edges.map(function (e) {
      var a = self.node(e.from), b = self.node(e.to);
      if (!a || !b) return null;
      var p1 = self.portPoint(a, 'out'), p2 = self.portPoint(b, 'in');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', self.curve(p1.x, p1.y, p2.x, p2.y));
      path.setAttribute('class', 'sheen-graph-edge');
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', (a.label || '') + ' → ' + (b.label || '') + (self.getAttribute('remove-label') ? ' (' + self.getAttribute('remove-label') + ')' : ''));
      path.addEventListener('keydown', function (ev) {
        if (ev.key === 'Delete' || ev.key === 'Backspace') {
          ev.preventDefault();
          self._edges = self.edges.filter(function (x) { return x !== e; });
          self.drawEdges(); self.changed();
        }
      });
      return path;
    }).filter(Boolean);
    this.svg.replaceChildren.apply(this.svg, paths);
  }
  // the nodes in pipeline order: follow the edges from the node nothing points to (unlinked nodes go last, by x)
  order() {
    var edges = this.edges, next = {}, hasIn = {};
    edges.forEach(function (e) { next[e.from] = e.to; hasIn[e.to] = true; });
    var seen = {}, out = [];
    var starts = this.nodes.filter(function (n) { return !hasIn[n.id]; }).sort(function (a, b) { return (a.x || 0) - (b.x || 0); });
    starts.forEach(function (s) { for (var id = s.id; id && !seen[id]; id = next[id]) { seen[id] = true; out.push(id); } });
    this.nodes.forEach(function (n) { if (!seen[n.id]) out.push(n.id); });
    return out;
  }
}
define('sheen-node-graph', SheenNodeGraph);

// ---- 60-tour.js
// <sheen-tour label="Welcome tour" next-label="Next" back-label="Back" done-label="Done" skip-label="Skip"
//             step-label="@n of @all">
//   A short guided tour. tour.steps = [{target: 'CSS selector', title, text}]; tour.start() / tour.stop().
//   Each step dims the page around its target and shows a glass card beside it (a non-modal dialog that keeps focus
//   inside while open): Enter or Next moves on, Back goes back, Esc or Skip ends. A step whose target is missing is
//   shown in the middle. Targets with display: contents have no box, so point at a child instead.
//   Fires "sheen-tour-step" {index} and "sheen-tour-end" {completed: true|false}.
class SheenTour extends HTMLElement {
  connectedCallback() {
    if (this.card) return;
    var self = this;
    this._steps = this._steps || [];
    this.index = 0;
    this.spot = h('div', { class: 'sheen-tour-spot', 'aria-hidden': 'true' });
    this.titleEl = h('h2', { class: 'sheen-headline', id: uid('tour-title') });
    this.textEl = h('p', { class: 'sheen-secondary' });
    this.countEl = h('span', { class: 'sheen-footnote sheen-tertiary sheen-num' });
    this.back = h('button', { type: 'button', class: 'sheen-button sheen-small', text: this.getAttribute('back-label') || '', onclick: function () { self.go(self.index - 1); } });
    this.next = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-glass-prominent', onclick: function () { self.go(self.index + 1); } });
    this.skip = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-tour-skip', text: this.getAttribute('skip-label') || '', onclick: function () { self.stop(false); } });
    this.card = h('div', { class: 'sheen-tour-card sheen-glass', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': this.titleEl.id, tabindex: '-1' },
      this.countEl, this.titleEl, this.textEl, h('div', { class: 'sheen-row sheen-tour-actions' }, this.skip, h('span', { class: 'sheen-tour-gap' }), this.back, this.next));
    this.replaceChildren(this.spot, this.card);
    this.hidden = true;
    this.card.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); self.stop(false); }
      else if (e.key === 'Enter' && e.target === self.card) { e.preventDefault(); self.go(self.index + 1); }
      else if (e.key === 'Tab') {
        var f = Array.prototype.slice.call(self.card.querySelectorAll('button:not([hidden])'));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    this.onResize = function () { if (!self.hidden) self.place(); };
    window.addEventListener('resize', this.onResize);
  }
  disconnectedCallback() { window.removeEventListener('resize', this.onResize); }
  get steps() { return this._steps || []; }
  set steps(v) { this._steps = Array.isArray(v) ? v : []; }
  get running() { return !this.hidden; }
  start(i) { this.hidden = false; this.go(i || 0); }
  stop(completed) {
    if (this.hidden) return;
    this.hidden = true;
    emit(this, 'sheen-tour-end', { completed: !!completed });
  }
  go(i) {
    if (i >= this.steps.length) { this.stop(true); return; }
    this.index = clamp(i, 0, this.steps.length - 1);
    var s = this.steps[this.index];
    this.titleEl.textContent = s.title || '';
    this.textEl.textContent = s.text || '';
    this.countEl.textContent = fill(this.getAttribute('step-label') || '', { n: this.index + 1, all: this.steps.length });
    this.back.hidden = this.index === 0;
    this.next.textContent = this.getAttribute(this.index === this.steps.length - 1 ? 'done-label' : 'next-label') || '';
    var t = s.target ? document.querySelector(s.target) : null;
    if (t && t.scrollIntoView) t.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    this.place();
    this.card.focus();
    emit(this, 'sheen-tour-step', { index: this.index });
  }
  place() {
    var s = this.steps[this.index] || {}, t = s.target ? document.querySelector(s.target) : null;
    var r = t ? t.getBoundingClientRect() : null, pad = 8;
    if (!r || (!r.width && !r.height)) {
      this.spot.hidden = true;
      this.card.classList.add('sheen-tour-center');
      this.card.style.top = ''; this.card.style.insetInlineStart = '';
      return;
    }
    this.spot.hidden = false;
    this.card.classList.remove('sheen-tour-center');
    this.spot.style.top = (r.top - pad) + 'px';
    this.spot.style.insetInlineStart = (isRtl(this) ? window.innerWidth - r.right - pad : r.left - pad) + 'px';
    this.spot.style.width = (r.width + pad * 2) + 'px';
    this.spot.style.height = (r.height + pad * 2) + 'px';
    var cardH = this.card.offsetHeight || 180, below = r.bottom + 16 + cardH < window.innerHeight;
    this.card.style.top = Math.max(12, below ? r.bottom + 16 : r.top - 16 - cardH) + 'px';
    var start = isRtl(this) ? window.innerWidth - r.right : r.left;
    this.card.style.insetInlineStart = clamp(start, 12, Math.max(12, window.innerWidth - (this.card.offsetWidth || 360) - 12)) + 'px';
  }
}
define('sheen-tour', SheenTour);

// ---- 99-api.js
// window.sheenElements: the version, the glyphs and a toast shortcut.
//   sheenElements.glyph(name, size?, label?) → <svg>    sheenElements.glyphNames() → [names]
//   sheenElements.toast({title, message, tone, timeout, action}) → id   (uses or adds a <sheen-toaster>)
//   sheenElements.fmtTime(seconds, precise?) → "1:05"
window.sheenElements = {
  version: VERSION,
  glyph: glyph,
  glyphNames: function () { return Object.keys(GLYPHS).sort(); },
  fmtTime: fmtTime,
  toast: function (opts) {
    var t = document.querySelector('sheen-toaster');
    if (!t) { t = document.createElement('sheen-toaster'); document.body.appendChild(t); }
    return t.show(opts);
  }
};

})();
