@echo off
rem Sobe a API usando o JDK 21 e o Maven baixados em %USERPROFILE%\tools (sem mexer no PATH do sistema).
setlocal
if not defined JAVA_HOME set "JAVA_HOME=%USERPROFILE%\tools\jdk-21.0.13+9"
set "PATH=%JAVA_HOME%\bin;%USERPROFILE%\tools\apache-maven-3.9.16\bin;%PATH%"
cd /d "%~dp0"
call mvn -q spring-boot:run %*
