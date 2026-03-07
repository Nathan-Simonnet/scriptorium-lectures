<template>
    <footer>
        <div class="map-container">
            <a class="map-link"
                href="https://www.google.com/maps/@43.6086056,1.4452177,18z?hl=fr&entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D"
                target="_blank">
                <img src="../assets/map.webp" alt="map view of the library">
            </a>
            <div class="map-informations">
                <p>1 Place Jeann d'Arc</p>
                <p>31000 Toulouse</p>
                <a
                    href="https://www.google.com/maps/@43.6086056,1.4452177,18z?hl=fr&entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D" target="_blank">Voir
                    sur la carte</a>
            </div>
        </div>
        <div class="phone-number-container">
            <p>01 12 35 81 32</p>
        </div>

        <div class="copyright-container">
            <p>Copyright 2025</p>
        </div>

        <div class="legal-information">
            <p>Mentions légales</p>
        </div>

    </footer>
</template>
<!-- ---------------------------- -->
<script setup lang='ts'>

</script>
<!-- ---------------------------- -->
<style>
footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 12px;

    min-height: 110px;
    width: 100%;
    padding: 12px;

    font-size: 1rem;

    .map-container {
        display: flex;
        justify-content: center;
        align-items: center;

        gap: 12px;

        .map-link,
        .map-link>img {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .map-link {
            max-width: 90px;
            max-height: 90px;

            img {
                object-fit: cover;
                width: 100%;
                height: 100%;
                border-radius: 12px;
            }
        }

        .map-link:hover {
            transform: scale(1.05);
            transition: 0.1s;
        }

        .map-informations {
            a {
                text-decoration: underline;
            }
        }
    }

}

@media screen and (max-width: 650px) {
    footer {
        padding: 6px;

        .map-container {
            .map-link {
                display: none;
            }
        }
    }
}
</style>