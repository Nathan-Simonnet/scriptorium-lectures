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
                sh '''
                    whoami
                    pwd
                    git --version
                    docker -v
                    docker compose version
                    ls -la
                '''
            }
        }

        stage('Prepare deploy directory') {
            steps {
                sh '''
                    echo "Checking deploy directory..."
                    ls -ld /opt/apps || true
                    ls -ld "$DEPLOY_DIR" || true
                    ls -l "$ENV_FILE" || true

                    test -d "$DEPLOY_DIR"
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
                    if [ -d public ]; then cp -r public "$DEPLOY_DIR/"; fi
                    cp docker-compose.yml "$DEPLOY_DIR/"
                    ls -la "$DEPLOY_DIR"
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
        stage('Smoke test') {
            steps {
                sh '''
                    curl -f https://scriptorium-lectures.fr
                    curl -f https://api.scriptorium-lectures.fr/api/health
                '''
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