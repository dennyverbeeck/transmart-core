/* Copyright © 2017 The Hyve B.V. */
package org.transmartproject.rest

import grails.transaction.Transactional
import groovy.transform.CompileStatic
import org.springframework.beans.factory.annotation.Autowired
import org.transmartproject.core.multidimquery.Hypercube
import org.transmartproject.core.multidimquery.MultiDimConstraint
import org.transmartproject.core.users.User
import org.transmartproject.db.multidimquery.QueryService
import org.transmartproject.db.multidimquery.query.BiomarkerConstraint
import org.transmartproject.db.multidimquery.query.Constraint
import org.transmartproject.rest.serialization.HypercubeProtobufSerializer
import org.transmartproject.rest.serialization.HypercubeSerializer
import org.transmartproject.rest.serialization.HypercubeJsonSerializer

@Transactional
class MultidimensionalDataService {

    @Autowired
    QueryService queryService

    /**
     * Type to represent the requested serialization format.
     */
    static enum Format {
        JSON('application/json'),
        PROTOBUF('application/x-protobuf'),
        NONE('none')

        private String format

        Format(String format) {
            this.format = format
        }

        public static Format from(String format) {
            Format f = values().find { it.format == format }
            if (f == null) throw new Exception("Unknown format: ${format}")
            f
        }

        public String toString() {
            format
        }
    }

    /**
     * Serialises hypercube data to <code>out</code>.
     *
     * @param hypercube the hypercube to serialise.
     * @param format the output format. Supports JSON and PROTOBUF.
     * @param out the stream to serialise to.
     */@CompileStatic
    void serialise(Hypercube hypercube, Format format, OutputStream out) {
        HypercubeSerializer serializer
        switch (format) {
            case Format.JSON:
                serializer = new HypercubeJsonSerializer()
                break
            case Format.PROTOBUF:
                serializer = new HypercubeProtobufSerializer()
                break
            default:
                throw new Exception("Unsupported format: ${format}")
        }
        serializer.write(hypercube, out)
    }

    void write(Format format,
               String type,
               MultiDimConstraint assayConstraint,
               MultiDimConstraint biomarkerConstraint,
               String projection,
               User user,
               OutputStream out) {

        Hypercube hypercube = queryService.highDimension(assayConstraint, biomarkerConstraint, projection, user, type)

        try {
            serialise(hypercube, format, out)
        } finally {
            hypercube.close()
            out.close()
        }


    }
}