pipeline {
    agent any

    options {
        skipDefaultCheckout()
        timestamps()
        disableConcurrentBuilds()
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
                sh 'ls -la'
            }
        }

        stage('Validate compose') {
            steps {
                sh 'docker compose config'
            }
        }

        stage('Build containers') {
            steps {
                sh 'docker compose build'
            }
        }
    }
}