pipeline {
    agent any

    environment {
        DEPLOY_DIR = '/opt/apps/scriptorium'
        ENV_FILE = '/opt/apps/scriptorium/.env'
    }

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

        stage('Prepare deploy directory') {
            steps {
                sh '''
                    mkdir -p "$DEPLOY_DIR"
                    test -f "$ENV_FILE"
                '''
            }
        }

        stage('Sync project') {
            steps {
                sh '''
                    rm -rf "$DEPLOY_DIR/backend" "$DEPLOY_DIR/frontend" "$DEPLOY_DIR/public"
                    cp -r backend "$DEPLOY_DIR/"
                    cp -r frontend "$DEPLOY_DIR/"
                    cp -r public "$DEPLOY_DIR/" || true
                    cp docker-compose.yml "$DEPLOY_DIR/"
                '''
            }
        }

        stage('Validate compose with env') {
            steps {
                sh '''
                    cd "$DEPLOY_DIR"
                    docker compose --env-file "$ENV_FILE" config
                '''
            }
        }

        stage('Build and deploy') {
            steps {
                sh '''
                    cd "$DEPLOY_DIR"
                    docker compose --env-file "$ENV_FILE" up -d --build
                '''
            }
        }
    }

    post {
        success {
            echo 'Déploiement terminé avec succès'
        }
        failure {
            echo 'Échec du pipeline'
        }
    }
}