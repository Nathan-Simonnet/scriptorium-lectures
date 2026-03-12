pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify environment') {
            steps {
                sh 'whoami'
                sh 'pwd'
                sh 'docker -v'
                sh 'docker compose version'
                sh 'node -v || true'
                sh 'yarn -v || true'
                sh 'ls -la'
            }
        }
    }
}