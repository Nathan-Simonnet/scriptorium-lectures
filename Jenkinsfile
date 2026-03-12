pipeline {
    agent any

    options {
        skipDefaultCheckout()
    }

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
                sh 'git --version'
                sh 'docker -v'
                sh 'docker compose version'
                sh 'docker ps'
                sh 'node -v || true'
                sh 'yarn -v || true'
                sh 'ls -la'
            }
        }
    }
}